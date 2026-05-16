import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// ArenaManager
// Uses a VideoTexture OR a Static Image on an orthographic-style background plane.
// Parallax is achieved by panning the UV offset — zero seeking, zero stutter.
// ─────────────────────────────────────────────────────────────────────────────

export class ArenaManager {
    constructor(scene, camera, config = {}, manager = null) {
        this.scene  = scene;
        this.camera = camera;
        this.manager = manager;

        // Expanded logical boundaries (matching Character.js ARENA_WALL)
        this.ARENA_MIN_X = -25;
        this.ARENA_MAX_X =  25;
        this.ARENA_W     =  50;
        
        // Dynamically configured for the user-provided high-res image background
        this.config = {
            type: 'image', // Set to 'image' as requested
            src: 'Assets/background/image_background.jpg', // Path to newly added image asset
            repeatX: 0.75, // Base repeat; will be recalculated on setBackground
            ...config
        };

        this._build();
    }

    _build() {
        let tex;

        if (this.config.type === 'video') {
            // Video element
            const video       = document.createElement('video');
            video.src         = this.config.src;
            video.loop        = true;
            video.muted       = true;
            video.playsInline = true;
            // Play immediately; resume on keydown if browser blocks it
            video.play().catch(() => {
                const resume = () => { video.play(); window.removeEventListener('keydown', resume); };
                window.addEventListener('keydown', resume);
            });
            this._video = video;
            tex = new THREE.VideoTexture(video);
        } else {
            // Static image fallback / deployer
            const loader = new THREE.TextureLoader();
            tex = loader.load(this.config.src);
        }

        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS      = THREE.ClampToEdgeWrapping;
        tex.wrapT      = THREE.ClampToEdgeWrapping;
        
        // ── UV Safe Zone ──
        // Set repeat.x < 1.0 so we have "room" to pan without hitting the edges.
        tex.repeat.set(this.config.repeatX, 1.0);
        this._tex = tex;

        // ── Background plane ──
        // Sized to fill the viewport perfectly, draw order ensures it's always in the back.
        const PLANE_Z = -20; // far behind the characters (camera is at z=9)

        const geo = new THREE.PlaneGeometry(1, 1);
        const mat = new THREE.MeshBasicMaterial({
            map:       tex,
            depthWrite: false,
            depthTest:  false,
            side:       THREE.FrontSide,
        });

        this._plane = new THREE.Mesh(geo, mat);
        this._plane.renderOrder = -100; // draw before everything else
        this._plane.position.z  = PLANE_Z;
        this._PLANE_Z           = PLANE_Z;
        this.scene.add(this._plane);
    }

    setBackground(src, yOffset = 0, zoom = 1.0) {
        this.yOffset = yOffset;
        this.zoom = zoom;
        const loader = new THREE.TextureLoader(this.manager);
        loader.load(src, (tex) => {
            if (this._tex) {
                this._tex.dispose(); // Prevent GPU memory leaks
            }
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS      = THREE.ClampToEdgeWrapping;
            tex.wrapT      = THREE.ClampToEdgeWrapping;
            
            // ── Dynamic Repeat Calculation ──
            // To maintain a consistent panning feel (0.3 pan room), we scale repeat inversely to zoom.
            const targetPanRoom = 0.3;
            const rx = (1.0 - targetPanRoom); // The final repeat on screen
            
            // This ensures rx is always 0.7, leaving 0.3 for panning.
            // The 'zoom' parameter will now control the PLANE distance or scale if we wanted 
            // a true zoom, but for UV panning, we must keep rx < 1.0.
            tex.repeat.set(rx, 1.0);
            
            // Center the texture
            tex.offset.set((1 - rx) / 2, 0);
            
            this._tex = tex;
            this._plane.material.map = tex;
            this._plane.material.needsUpdate = true;
        });
    }

    update(playerX, dt) {
        if (!this._tex) return;

        // ── 30Hz Throttling ──
        this._updateTimer = (this._updateTimer || 0) + dt;
        if (this._updateTimer < 0.033) return; // ~30Hz
        this._updateTimer = 0;

        const camZ  = this.camera.position.z;
        const dist  = Math.abs(camZ - this._PLANE_Z);
        
        // Cache previous values to skip redundant updates (lerp-safe)
        if (!this._lastCamZ || Math.abs(this._lastCamZ - camZ) > 0.01) {
            const vFov  = this.camera.fov * (Math.PI / 180);
            const h     = 2 * Math.tan(vFov / 2) * dist;
            const w     = h * this.camera.aspect;

            // Add a 50% buffer to height and width to ensure no gaps at edges
            this._plane.scale.set(w * 1.5, h * 1.5, 1);
            this._lastCamZ = camZ;
            this._lastW = w;
        }
        
        // Follow camera X & Y, applying the vertical offset for floor alignment
        this._plane.position.set(
            this.camera.position.x, 
            this.camera.position.y + (this.yOffset || 0), 
            this._PLANE_Z
        );

        // ── UV panning for parallax ──
        const t              = (playerX - this.ARENA_MIN_X) / this.ARENA_W;
        const clampedT       = Math.max(0, Math.min(1, t));
        
        // Calculate base offset to keep texture centered
        const rx = this._tex.repeat.x;
        const baseOffsetX = (1 - rx) / 2;
        
        // Add dynamic parallax panning
        const panRange       = 1.0 - rx; 
        // We only pan if rx < 1.0, otherwise panRange is 0 or negative (which we clamp to 0)
        const activePan = Math.max(0, panRange);
        
        this._tex.offset.x   = baseOffsetX + (clampedT - 0.5) * activePan;
    }
}

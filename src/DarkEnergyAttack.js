import * as THREE from 'three';

export class DarkEnergyAttack {
    constructor(scene, startPos, targetObj, attacker) {
        this.scene = scene;
        this.targetObj = targetObj;
        this.attacker = attacker;
        
        this.group = new THREE.Group();
        this.group.position.copy(startPos);
        this.group.position.y += 1.5; // Torso height
        
        this.scene.add(this.group);
        
        this.particles = [];
        this.lightningArcs = [];
        this.active = true;
        this.age = 0;
        this.MAX_AGE = 2.5;
        this.hasHit = false;
        
        this._initVisuals();

        // Play throw audio burst
        if (this.attacker && typeof this.attacker.playSound === 'function') {
            this.attacker.playSound('dark_aura_b', 1.15); // Crisp launch
        }
    }
    
    _initVisuals() {
        // Sinister Absolute Void Deep Purple Radial Gradients
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        grad.addColorStop(0, '#330066');       // Deep sinister indigo core (no white!)
        grad.addColorStop(0.3, '#1a0033');     // Ultra dark heavy purple
        grad.addColorStop(0.6, '#0a0015');     // Pitch black shadow-purple boundary
        grad.addColorStop(0.85, '#03000a');    // Absolute dark void shell
        grad.addColorStop(1.0, 'rgba(0,0,0,0)'); 
        
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        
        const coreTex = new THREE.CanvasTexture(canvas);
        const coreMat = new THREE.SpriteMaterial({
            map: coreTex, 
            color: 0xffffff, 
            transparent: true 
            // Normal Blending guarantees massive opaque weight and deep dark colors!
        });
        
        this.coreSprite = new THREE.Sprite(coreMat);
        this.coreSprite.scale.set(3.2, 3.2, 3.2);
        this.group.add(this.coreSprite);

        // ⚡ Programmatic High-Frequency Electric Lightning Arcs (Kept Additive for contrast!)
        const arcMat = new THREE.LineBasicMaterial({ 
            color: 0xcc88ff, // Deep electric lavender
            transparent: true, 
            opacity: 0.95, 
            blending: THREE.AdditiveBlending,
            linewidth: 2 
        });
        
        const numArcs = 4;
        for (let i = 0; i < numArcs; i++) {
            const arcGeo = new THREE.BufferGeometry();
            const points = [];
            for (let j = 0; j < 5; j++) points.push(new THREE.Vector3());
            arcGeo.setFromPoints(points);
            const arcLine = new THREE.Line(arcGeo, arcMat);
            this.group.add(arcLine);
            this.lightningArcs.push(arcLine);
        }

        // Heavy Void Ember trails
        const numParticles = 18;
        for (let i = 0; i < numParticles; i++) {
            const pMat = new THREE.SpriteMaterial({
                map: coreTex, 
                color: 0x550099, // Tinted heavy dark violet
                transparent: true, 
                opacity: 0.9 
            });
            const pSprite = new THREE.Sprite(pMat);
            pSprite.userData = {
                velX: (Math.random() - 0.5) * 2.5,
                velY: (Math.random() - 0.5) * 2.5,
                velZ: (Math.random() - 0.5) * 2.5,
                life: Math.random()
            };
            pSprite.scale.set(0.6, 0.6, 0.6);
            this.group.add(pSprite); 
            this.particles.push(pSprite);
        }
    }
    
    update(dt) {
        if (!this.active) return;
        
        this.age += dt;
        if (this.age > this.MAX_AGE) { this.destroy(); return; }
        
        // Chaotic high-frequency pulsing size
        const pulse = 3.2 + Math.sin(this.age * 25) * 0.5;
        this.coreSprite.scale.set(pulse, pulse, pulse);
        
        // Update lightning arcs to flicker chaotically
        if (Math.random() > 0.35) { // 65% frame flicker presence
            this.lightningArcs.forEach(arc => {
                const points = [];
                let curPos = new THREE.Vector3(0, 0, 0); // Root to sphere center
                points.push(curPos.clone());
                
                // Generate chaotic branched coordinates
                const numSegs = 4;
                const ext = 1.8; // Spread distance
                for (let s = 1; s <= numSegs; s++) {
                    curPos.x += (Math.random() - 0.5) * ext;
                    curPos.y += (Math.random() - 0.5) * ext;
                    curPos.z += (Math.random() - 0.5) * ext;
                    points.push(curPos.clone());
                }
                arc.geometry.setFromPoints(points);
                arc.geometry.attributes.position.needsUpdate = true;
                arc.visible = true;
            });
        } else {
            // Silence lightning occasionally for strobe-flicker feel
            this.lightningArcs.forEach(arc => arc.visible = false);
        }
        
        // Recyclable high-velocity particle tails
        this.particles.forEach(p => {
            p.userData.life += dt * 2.5;
            if (p.userData.life > 1.0) { p.position.set(0, 0, 0); p.userData.life = 0; }
            
            // Drifts backward relative to movement direction
            p.position.x += (p.userData.velX - 5.5 * (this.attacker.attackDirection || 1)) * dt;
            p.position.y += p.userData.velY * dt;
            p.position.z += p.userData.velZ * dt;
            
            const factor = 1.0 - p.userData.life;
            p.scale.set(0.6 * factor, 0.6 * factor, 0.6 * factor);
            p.material.opacity = factor * 0.85;
        });

        if (!this.hasHit) {
            const speed = 20.0; // Sinister velocity
            this.group.position.x += (this.attacker.attackDirection || 1) * speed * dt;
            
            // Dynamic mesh bounds detection
            if (this.targetObj && this.targetObj.model) {
                const targetPos = this.targetObj.model.position.clone().add(new THREE.Vector3(0, 1.5, 0));
                
                const attackPos = this.group.position.clone();
                attackPos.z = 0;
                const scanTargetPos = targetPos.clone();
                scanTargetPos.z = 0;
                
                const dist = attackPos.distanceTo(scanTargetPos);
                
                if (dist < 2.3) {
                    // Delivers lore-specified 15 HP impact damage
                    this.targetObj.takeDamage(15, true);
                    this.hasHit = true;
                    
                    // Play heavy impact audio crash
                    if (this.attacker && typeof this.attacker.playSound === 'function') {
                        this.attacker.playSound('dark_aura_b', 0.9); // Dark impact
                    }
                    
                    // Massive violent purple flash on collision
                    this.coreSprite.scale.set(8.0, 8.0, 8.0);
                    this.lightningArcs.forEach(arc => arc.visible = false); // Extinguish lighting on crash
                    
                    setTimeout(() => this.destroy(), 200);
                }
            }
        }
    }
    
    destroy() {
        if (!this.active) return;
        this.active = false;
        this.scene.remove(this.group);
        
        // Meticulous asset cleanup
        this.coreSprite.material.map.dispose();
        this.coreSprite.material.dispose();
        this.particles.forEach(p => p.material.dispose());
        this.lightningArcs.forEach(arc => {
            arc.geometry.dispose();
            arc.material.dispose();
        });
    }
}

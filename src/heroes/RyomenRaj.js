import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Character } from '../Character.js?v=49';
import { DomainExpansionAttack } from '../DomainExpansionAttack.js?v=49';
import { DarkEnergyAttack } from '../DarkEnergyAttack.js?v=49';
import { CHARACTER_CONFIGS } from '../CharacterConfigs.js?v=49';

export class RyomenRaj extends Character {
    constructor(scene, inputManager, config, isPlayerOne = true, loadingManager = null) {
        super(scene, inputManager, config, isPlayerOne, loadingManager);
        
        this.immuneToAcademics = true; // The King is completely unfazed by grades!
        
        // Domain form properties
        this.domainModel = null;
        this.domainMixer = null;
        this.domainActions = {};
        this.domainHitboxes = {};
        this.domainFootOffset = 0;
        
        this.isDomainActive = false;
        this.domainTimeout = null;
        
        // Pointers to cache basic form
        this.basicModel = null;
        this.basicMixer = null;
        this.basicActions = {};
        this.basicHitboxes = {};
        // Domain enhancement properties
        this.domainLights = [];
        this.redGround = null;

        // Secret Art combo chain trackers
        this._secretComboWindowActive = false;
        this._secretComboTriggered = false;
    }

    takeDamage(amount, isMagic = false, isParalyze = false) {
        if (isParalyze) {
            console.log('[RyomenRaj] The King is IMMUNE to paralysis/tricks and their damage!');
            return; // Takes absolutely ZERO damage, and is not paralyzed!
        }
        super.takeDamage(amount, isMagic, isParalyze);
    }

    async _loadAllModels() {
        // 1. Load base Ryomen Raj (basic form)
        await super._loadAllModels();
        
        // 2. Load Domain Form Model
        console.log('[RyomenRaj] Preloading Domain Expansion model & assets...');
        const loader = new GLTFLoader(this.loadingManager);
        const dConfig = CHARACTER_CONFIGS['ryomen_raj_domain'];
        
        try {
            const gltf = await loader.loadAsync(dConfig.baseUrl + dConfig.animations.idle);
            this.domainModel = gltf.scene;
            this.domainModel.visible = false; // Start hidden
            this.domainMixer = new THREE.AnimationMixer(this.domainModel);
            this.scene.add(this.domainModel);
            
            // Clone & lock root track for domain idle to prevent Z-drift
            const dIdle = gltf.animations[0];
            const rootTrackPattern = /mixamorig:?Hips\.position|Hips\.position|Pelvis\.position|Root\.position/i;
            this._domainLockInitialX = 0;
            this._domainLockInitialZ = 0;
            dIdle.tracks.forEach(t => {
                if (rootTrackPattern.test(t.name)) {
                    this._domainLockInitialX = t.values[0];
                    this._domainLockInitialZ = 0; // Prevent background offset drift for the Sovereign form
                    for (let i = 0; i < t.values.length; i += 3) {
                        t.values[i] = this._domainLockInitialX;
                        t.values[i + 2] = 0; // Ensure alignment to Z = 0
                    }
                }
            });
            
            this.domainActions['idle'] = this.domainMixer.clipAction(dIdle);
            this.domainActions['idle'].setLoop(THREE.LoopRepeat);
            
            // Force play idle at 100% weight to get the true, animated bone positions
            this.domainActions['idle'].play();
            
            // Setup domain scale & offset
            this.domainModel.scale.setScalar(dConfig.manualScale || 200);
            // Poses domain rig skeleton to accurately compute bone positions
            this.domainMixer.update(0.016);
            this.domainModel.updateMatrixWorld(true);
            
            // ── Calculate Perfect Offset ──
            if (dConfig.staticFootOffset !== undefined) {
                if (dConfig.staticFootOffset === 'use_box') {
                    const box = new THREE.Box3().setFromObject(this.domainModel);
                    let modelPos = new THREE.Vector3();
                    this.domainModel.getWorldPosition(modelPos);
                    this.domainFootOffset = isFinite(box.min.y) ? (modelPos.y - box.min.y) : 0;
                } else {
                    this.domainFootOffset = dConfig.staticFootOffset;
                }
            } else {
                let dLowestY = Infinity;
                this.domainModel.traverse(node => {
                    if (node.isBone && (node.name.toLowerCase().includes('foot') || node.name.toLowerCase().includes('toe'))) {
                        const pos = new THREE.Vector3();
                        node.getWorldPosition(pos);
                        if (pos.y < dLowestY) dLowestY = pos.y;
                    }
                });

                if (dLowestY !== Infinity) {
                    let modelPos = new THREE.Vector3();
                    this.domainModel.getWorldPosition(modelPos);
                    this.domainFootOffset = modelPos.y - dLowestY;
                } else {
                    const box = new THREE.Box3().setFromObject(this.domainModel);
                    let modelPos = new THREE.Vector3();
                    this.domainModel.getWorldPosition(modelPos);
                    this.domainFootOffset = isFinite(box.min.y) ? (modelPos.y - box.min.y) : 0;
                }
            }
            console.log(`[RyomenRaj] Domain Expansion perfect foot offset calculated: ${this.domainFootOffset.toFixed(3)}`);
            
            // Traverse meshes for shadow/GPU configuration
            this.domainModel.traverse(node => {
                node.frustumCulled = false;
                if (node.isMesh || node.isSkinnedMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.geometry) {
                        node.geometry.computeBoundingBox();
                        node.geometry.computeBoundingSphere();
                    }
                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                    mats.forEach(m => { if (m) m.side = m.shadowSide = THREE.DoubleSide; });
                }
                if (node.name === 'mixamorigRightHand') this.domainHitboxes.handR = node;
                if (node.name === 'mixamorigRightFoot') this.domainHitboxes.footR = node;
            });
            
            // Listen for domain animation completion to auto-reset states
            this.domainMixer.addEventListener('finished', (e) => {
                if (this.isDead || this.isVictory) return;
                const act = e.action;
                const resetKeys = ['punch','kick','special','magic','combo1','combo2','hit_light','hit_medium','get_up'];
                for (const k of resetKeys) {
                    if (this.domainActions[k] === act && act === this.currentAction) {
                        this._resetState();
                        return;
                    }
                }
            });
            
            // Load Domain background animations
            this._loadDomainBackgroundAnims(loader, dConfig.baseUrl, dConfig.animations);

            console.log('[RyomenRaj] Domain Expansion form preloaded successfully!');
        } catch (err) {
            console.error('[RyomenRaj] Error preloading Domain Expansion assets:', err);
        }
    }

    async _loadDomainBackgroundAnims(loader, baseUrl, animations) {
        const loopOnceKeys  = new Set(['punch','kick','special','magic','combo1','combo2','hit_light','hit_medium','ko','get_up','victory','jump']);
        const clampKeys     = new Set(['ko','get_up','victory','jump','punch','kick','special','magic','combo1','combo2','hit_light','hit_medium']);
        const rootTrackPattern = /mixamorig:?Hips\.position|Hips\.position|Pelvis\.position|Root\.position/i;

        for (const [key, file] of Object.entries(animations)) {
            if (key === 'idle') continue;
            loader.loadAsync(baseUrl + file).then(gltf => {
                if (!gltf.animations.length) return;
                const clip = gltf.animations[0];
                
                // Clean drift tracks on action animations
                const lockKeys = ['run','back','special','combo1','combo2','victory','jump','punch','kick','magic','hit_light','hit_medium','ko','get_up'];
                if (lockKeys.includes(key)) {
                    clip.tracks.forEach(t => {
                        if (rootTrackPattern.test(t.name)) {
                            const fx = this._domainLockInitialX !== undefined ? this._domainLockInitialX : t.values[0];
                            for (let i = 0; i < t.values.length; i += 3) {
                                t.values[i] = fx;
                                t.values[i + 2] = 0; // Force zero Z offset on domain action root motion
                            }
                        }
                    });
                }

                const action = this.domainMixer.clipAction(clip);
                if (loopOnceKeys.has(key)) {
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = clampKeys.has(key);
                } else {
                    action.setLoop(THREE.LoopRepeat);
                }
                this.domainActions[key] = action;
            }).catch(e => console.warn(`[RyomenRaj] Domain anim load fail "${key}":`, e));
        }
    }

    // Spawn the reality-tearing Domain Expansion dark void sphere and transform!
    spawnMagicProjectile(startPos) {
        this.projectiles.push(new DomainExpansionAttack(this.scene, startPos, this.opponent, this));
    }

    switchToDomain() {
        if (this.isDomainActive || !this.domainModel) return;
        this.isDomainActive = true;
        console.log('[RyomenRaj] <<< ENTERING DOMAIN FORM >>>');

        // 1. Cache current basic configurations
        this.basicConfig = this.config;
        this.basicModel = this.model;
        this.basicMixer = this.mixer;
        this.basicActions = { ...this.actions };
        this.basicHitboxes = { ...this.hitboxes };
        this.basicFootOffset = this._footOffset;

        // 2. Rebind operational pointers to Domain state
        this.config = CHARACTER_CONFIGS['ryomen_raj_domain'];
        this.model = this.domainModel;
        this.mixer = this.domainMixer;
        this.actions = this.domainActions;
        this.hitboxes = this.domainHitboxes;
        
        // 3. Visual Swap
        this.basicModel.visible = false;
        this.domainModel.visible = true;

        // 4. Sync position/rotation
        this.domainModel.position.copy(this.basicModel.position);
        this.domainModel.rotation.copy(this.basicModel.rotation);

        // 5. Enter immediate state
        this.currentAction = null;
        this._resetState(); // Automatically triggers fadeTo('idle') in the correct form

        // ── Static Domain Foot Calibration ──
        // We use the flawlessly pre-calculated domainFootOffset from _loadDomainModels 
        // because measuring bones while the idle animation is blending (fading in) produces garbage data.
        this._footOffset = this.domainFootOffset;
        this.domainModel.position.y = this.pos.y + this._footOffset;

        // 6. Crimson Reality Shift (Arena Paint & Lights)
        try {
            // Add semi-opaque blood pool slightly above actual floor (-3.0)
            const geo = new THREE.PlaneGeometry(80, 80);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x880000, // Cursed Blood Red
                transparent: true,
                opacity: 0.55,
                side: THREE.DoubleSide
            });
            this.redGround = new THREE.Mesh(geo, mat);
            this.redGround.rotation.x = -Math.PI / 2;
            this.redGround.position.set(this.pos.x, -2.99, 0); // Centered on character
            this.scene.add(this.redGround);

            // Add dramatic crimson lighting setup
            const ambLight = new THREE.AmbientLight(0xff0000, 1.8);
            const ptLight = new THREE.PointLight(0xff3333, 35, 40);
            ptLight.position.set(this.pos.x, 5, 2);
            this.scene.add(ambLight);
            this.scene.add(ptLight);
            this.domainLights.push(ambLight, ptLight);
        } catch (e) { console.warn('[RyomenRaj] Crimson FX error:', e); }

        // 8. Cursed Audio Stitches
        this.playSound('domain_hum', 1.0);

        // Schedule reversion back to basic form in 8.0 seconds
        if (this.domainTimeout) clearTimeout(this.domainTimeout);
        this.domainTimeout = setTimeout(() => this.switchToBasic(), 8000);
    }

    switchToBasic() {
        if (!this.isDomainActive || this.isDead) return;
        this.isDomainActive = false;
        console.log('[RyomenRaj] <<< EXITING DOMAIN FORM >>>');

        // 1. Rebind operational pointers back to Basic state
        this.model = this.basicModel;
        this.mixer = this.basicMixer;
        this.actions = this.basicActions;
        this.hitboxes = this.basicHitboxes;
        this._footOffset = this.basicFootOffset;

        // 2. Visual Swap
        this.domainModel.visible = false;
        this.basicModel.visible = true;

        // 3. Sync position
        this.basicModel.position.copy(this.domainModel.position);
        this.basicModel.rotation.copy(this.domainModel.rotation);

        // 4. Play base Idle
        this.currentAction = null;
        this._resetState();

        // 5. Cleanup Crimson FX & Fallen Legion
        try {
            // Dispose and remove unique blood floor
            if (this.redGround) {
                this.scene.remove(this.redGround);
                if (this.redGround.geometry) this.redGround.geometry.dispose();
                if (this.redGround.material) this.redGround.material.dispose();
                this.redGround = null;
            }

            // Remove domain specific lighting
            this.domainLights.forEach(light => this.scene.remove(light));
            this.domainLights = [];
        } catch (e) { console.warn('[RyomenRaj] Domain Cleanup fail:', e); }
    }

    onAnimationsLoaded() {
        super.onAnimationsLoaded();
        
        if (this.actions['combo2']) {
            this.actions['combo2'].setEffectiveTimeScale(1.2);
        }
        if (this.actions['victory']) {
            this.actions['victory'].setEffectiveTimeScale(0.9);
        }
        
        // Configure Secret Art combo branch reset mechanics
        if (this.actions['secret_art']) {
            this.actions['secret_art'].setLoop(THREE.LoopOnce);
            this.actions['secret_art'].clampWhenFinished = false;
        }

        // Safely reset to basic state when the secret art finisher completes
        if (this.mixer) {
            this.mixer.addEventListener('finished', (e) => {
                if (this.actions['secret_art'] && e.action === this.actions['secret_art']) {
                    this._resetState();
                }
            });
        }
    }

    // ─── Combat Override for Domain Mode ──────────────────────────────────────
    _startAttack(animKey, timerOffset = 0) {
        if (this.isDomainActive) {
            // Block standard combos in domain form as requested ("just want 2 moves")
            if (animKey === 'combo1' || animKey === 'combo2') {
                console.log('[RyomenRaj] Combos blocked in Domain Form!');
                return;
            }
            
            if (animKey === 'punch') {
                // Execute animation at normal speed
                super._startAttack('punch', timerOffset);
                // Throw custom Dark Energy projectile after 2.0s epic charging!
                setTimeout(() => {
                    if (this.isDead || !this.isDomainActive) return;
                    this.spawnDarkEnergyProjectile();
                }, 2000);
                return;
            }
            
            if (animKey === 'kick') {
                // Execute animation
                super._startAttack('kick', timerOffset);
                // Power ground slam shake after slam frames (0.5s)
                setTimeout(() => {
                    if (this.isDead || !this.isDomainActive) return;
                    this.triggerGroundShake();
                }, 500);
                return;
            }
        }
        // Standard behavior for basic form or non J/K actions
        super._startAttack(animKey, timerOffset);
    }

    spawnDarkEnergyProjectile() {
        if (!this.scene || !this.opponent) return;
        
        const sp = this.pos.clone();
        sp.x += (this.attackDirection || (this.isPlayerOne ? 1 : -1)) * 0.6;
        
        console.log('[RyomenRaj] Casting Sinister Dark Energy Projectile!');
        const proj = new DarkEnergyAttack(this.scene, sp, this.opponent, this);
        this.projectiles.push(proj);
    }

    triggerGroundShake() {
        if (!this.scene) return;
        console.log('[RyomenRaj] Slamming floor: Activating Earth Shake!');

        // 1. High-frequency dynamic screen shake by perturbing scene coordinates
        let shakeAge = 0;
        const duration = 0.5;  // 0.5 seconds shake
        const intensity = 0.35; // Solid feedback strength
        const originalScenePos = this.scene.position.clone();
        
        const interval = setInterval(() => {
            if (!this.scene || this.isDead) { 
                clearInterval(interval); 
                return; 
            }
            shakeAge += 0.033;
            if (shakeAge >= duration) {
                this.scene.position.copy(originalScenePos);
                clearInterval(interval);
                return;
            }
            // Falloff intensity smoothly
            const strength = intensity * (1.0 - (shakeAge / duration));
            this.scene.position.x = originalScenePos.x + (Math.random() - 0.5) * strength;
            this.scene.position.y = originalScenePos.y + (Math.random() - 0.5) * strength;
        }, 33);

        // 2. Ground Shockwave Ripple FX
        this.spawnShockwaveRipple();

        // 3. Dynamic Area Ground Shock Damage
        if (this.opponent && !this.opponent.isDead) {
            const dist = Math.abs(this.opponent.pos.x - this.pos.x);
            // Deals damage if opponent is grounded and within 8 meters
            if (dist < 8.0 && this.opponent.pos.y < -2.0) {
                this.opponent.takeDamage(18, true); // Premium weighted shock damage
            }
        }
    }

    spawnShockwaveRipple() {
        try {
            // Crimson-purple growing energy ring
            const ringGeo = new THREE.RingGeometry(0.1, 1.8, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xaa0033,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.copy(this.pos);
            ring.position.y = -2.95; // Ground-hugging offset
            
            this.scene.add(ring);
            
            let scale = 1.0;
            const rippleInt = setInterval(() => {
                if (!this.scene || !ring) { clearInterval(rippleInt); return; }
                scale += 0.6;
                ring.scale.setScalar(scale);
                ringMat.opacity -= 0.06;
                
                if (ringMat.opacity <= 0) {
                    this.scene.remove(ring);
                    ringGeo.dispose();
                    ringMat.dispose();
                    clearInterval(rippleInt);
                }
            }, 25);
        } catch (e) { console.warn('[RyomenRaj] Shockwave fail:', e); }
    }

    // ─── Secret Art Combo Chaining ───────────────────────────────────────────
    
    update(dt) {
        super.update(dt);
        
        // Listen for J (punch) keypress window only during basic combo1 execution
        if (!this.isDomainActive && this.isAttacking && this.currentAction === this.actions['combo1']) {
            const clip = this.currentAction.getClip();
            if (clip) {
                const dur = clip.duration;
                const cur = this.currentAction.time;
                
                // Chain Window: between 60% and 85% of Knee Jabs To Uppercut
                const startWin = dur * 0.60;
                const endWin   = dur * 0.85;
                
                if (cur >= startWin && cur <= endWin) {
                    this._secretComboWindowActive = true;
                    
                    // Detect chain input trigger
                    if (this.input && this.input.keys.punch && !this._secretComboTriggered) {
                        console.log('[RyomenRaj] <<< SECRET ART CHAINED SUCCESSFULLY >>>');
                        this._secretComboTriggered = true;
                        this.triggerSecretArtCombo();
                    }
                } else {
                    this._secretComboWindowActive = false;
                }
            }
        } else {
            // Reset combo chain state
            this._secretComboTriggered = false;
            this._secretComboWindowActive = false;
        }
    }

    // Seamlessly cut into Secret Finisher
    triggerSecretArtCombo() {
        if (!this.actions['secret_art']) {
            console.warn('[RyomenRaj] Secret Art action not loaded!');
            return;
        }
        
        // Force transition and preserve attack lock state
        this.fadeTo('secret_art');
        this.isAttacking = true; 
        
        // Fire satisfying high-impact vocal cue
        this.playSound('combo', 1.0);
    }

    // Override damage detection for Secret Art combo finisher
    _checkCombat() {
        if (this.currentAction === this.actions['secret_art']) {
            const dmg = 4;
            
            if (this.hitCooldown > 0) return;
            
            if (this.opponent && this.opponent.model && !this.opponent.isDead) {
                // Use gameplay pos for scale-immune distance check
                const dir = this.attackDirection || Math.sign(this.opponent.pos.x - this.pos.x);
                const attackPos = new THREE.Vector3(
                    this.pos.x + dir * 0.8,
                    this.pos.y + 1.2, // fist height
                    0
                );
                const oppPos = new THREE.Vector3(
                    this.opponent.pos.x,
                    this.opponent.pos.y + 1.2,
                    0
                );
                
                const dist = attackPos.distanceTo(oppPos);
                
                if (dist < 2.4) {
                    // High frequency sequential contact hits
                    this.opponent.takeDamage(dmg, false);
                    this.hitCooldown = 0.25;
                    
                    // Visual spark impact burst
                    this.spawnSecretArtImpact(attackPos);
                }
            }
            return; // Handled custom sequence
        }
        super._checkCombat();
    }

    spawnSecretArtImpact(pos) {
        try {
            const flareGeo = new THREE.SphereGeometry(0.25, 16, 16);
            const flareMat = new THREE.MeshBasicMaterial({
                color: 0xff0066, // Violet-red flare
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending
            });
            const flare = new THREE.Mesh(flareGeo, flareMat);
            flare.position.copy(pos);
            this.scene.add(flare);
            
            let sc = 1.0;
            const flareInt = setInterval(() => {
                if (!this.scene || !flare) { clearInterval(flareInt); return; }
                sc += 0.5;
                flare.scale.setScalar(sc);
                flareMat.opacity -= 0.12;
                if (flareMat.opacity <= 0) {
                    this.scene.remove(flare);
                    flareGeo.dispose();
                    flareMat.dispose();
                    clearInterval(flareInt);
                }
            }, 25);
        } catch (e) { console.warn('[RyomenRaj] Flare FX fail:', e); }
    }
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Character } from '../Character.js?v=49';
import { CgpaAttack } from '../CgpaAttack.js?v=49';

export class Harshita_S extends Character {
    constructor(scene, inputManager, config, isPlayerOne = true, loadingManager = null) {
        super(scene, inputManager, config, isPlayerOne, loadingManager);
    }

    async _loadAllModels() {
        // 1. Load our actual model (Stand.glb) to establish the unique skin/rig
        await super._loadAllModels();

        // 2. Load base Harshita's Idle.glb to extract ONLY the upright idle animation
        console.log('[Harshita_S] Swapping out the crouch-idle loop with base Harshita\'s upright animation...');
        const loader = new GLTFLoader(this.loadingManager);
        const baseHarshitaIdlePath = 'Assets/heroes/harshita/glb_harshita/Idle.glb';

        try {
            const gltf = await loader.loadAsync(baseHarshitaIdlePath);
            if (gltf.animations && gltf.animations.length > 0) {
                const correctIdleClip = gltf.animations[0].clone();

                // Lock X and Z tracks just like in Character.js to prevent any drift
                const rootTrackPattern = /mixamorig:?Hips\.position|Hips\.position|Pelvis\.position|Root\.position/i;
                correctIdleClip.tracks.forEach(t => {
                    if (rootTrackPattern.test(t.name)) {
                        const initialX = t.values[0];
                        for (let i = 0; i < t.values.length; i += 3) {
                            t.values[i] = initialX;
                            t.values[i + 2] = 0; // Strictly lock substituted animation to Z = 0
                        }
                    }
                });

                const oldIdleAction = this.actions['idle'];
                
                // Create the new clip action tied to this character's model mixer
                const newIdleAction = this.mixer.clipAction(correctIdleClip);
                newIdleAction.setLoop(THREE.LoopRepeat);
                
                // Store it back in the actions object
                this.actions['idle'] = newIdleAction;

                // If we're currently playing the old idle animation, transition to the correct one immediately
                if (this.currentAction === oldIdleAction) {
                    if (oldIdleAction) oldIdleAction.stop();
                    newIdleAction.play();
                    this.currentAction = newIdleAction;
                }

                // ─── UPGRADE: Dynamic Upright Recalibration ───────────────────
                // 1. Force the animation mixer to compute the skeleton in upright idle stance
                this.mixer.update(0.016);

                // 2. Restore the standard manual scale configured for this character GLB
                this.model.scale.setScalar(this.config.manualScale || 200);

                // 3. Recalibrate exact foot offset using live animation bone coordinates
                this._recalibrateFootOffset();
            }
        } catch (err) {
            console.error('[Harshita_S] Failed to override sitting animation with base idle:', err);
        }
    }

    // Override the magic projectile spawning logic
    spawnMagicProjectile(startPos) {
        this.projectiles.push(new CgpaAttack(this.scene, startPos, this.opponent, this));
    }

    // Optional hook if we want to apply custom time scales
    onAnimationsLoaded() {
        super.onAnimationsLoaded();
        
        // Speed up the jump animation so she lands faster
        if (this.actions['jump']) {
            this.actions['jump'].setEffectiveTimeScale(1.5);
        }
    }
}

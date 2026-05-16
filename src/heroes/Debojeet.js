import * as THREE from 'three';
import { Character } from '../Character.js?v=49';
import { InfernoFistAttack } from '../InfernoFistAttack.js?v=49';

export class Debojeet extends Character {
    constructor(scene, inputManager, config, isPlayerOne = true, loadingManager = null) {
        super(scene, inputManager, config, isPlayerOne, loadingManager);
        
        // Active grab properties
        this.grabActive = false;
    }

    // Override playSound to suppress the combo startup sound specifically for combo2
    playSound(key, volume = 1.0) {
        if (key === 'combo' && this.currentAction === this.actions['combo2']) {
            return; // Suppress multi-hit startup sound for Flying Drop Kick
        }
        super.playSound(key, volume);
    }

    // Override attack trigger to initiate diving grapple animation with active frame scanning
    _startAttack(animKey, timerOffset = 0) {
        if (animKey === 'special') {
            console.log('[Debojeet] Initiating Diving Grapple Special Attack');
            this.grabActive = false;
            this.slamTriggered = false;
            this.grabLockInitiated = false; // Resets scanner for new dive
        }
        super._startAttack(animKey, timerOffset);
    }

    // Physical slam execution
    executeGrabSlam() {
        if (!this.opponent || this.opponent.isDead) return;
        console.log('[Debojeet] BOOM! Absolute Ground Slam!');
        
        // Play devastating slam audio impact cue
        this.playSound('kick', 0.8);
        
        // Spawn premium concrete dirt/shockwave visual ring at impact site
        this.spawnSlamImpactVisual(this.opponent.pos.clone());

        // Deal heavy physical slam damage (28 HP) and paralyze opponent on ground till hit
        this.opponent.takeDamage(28, false, true); 
        
        // Release grab state and restore gravity
        this.grabActive = false;
        this.opponent.pos.y = -3.0;
    }

    // Create expanding dirt shockwave on impact
    spawnSlamImpactVisual(impactPos) {
        try {
            const ringGeo = new THREE.RingGeometry(0.1, 1.8, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xdcb38a, // Sand/Dust color
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.copy(impactPos);
            ring.position.y = -2.97; // Sits right above stage level
            
            this.scene.add(ring);
            
            let sc = 1.0;
            const ringIntv = setInterval(() => {
                if (!this.scene || !ring) { clearInterval(ringIntv); return; }
                
                // Expand and fade out cleanly
                sc += 0.45;
                ring.scale.setScalar(sc);
                ringMat.opacity -= 0.09;
                
                if (ringMat.opacity <= 0) {
                    this.scene.remove(ring);
                    ringGeo.dispose();
                    ringMat.dispose();
                    clearInterval(ringIntv);
                }
            }, 30);
        } catch (e) { /* fail silently */ }
    }

    // Overridden: Custom combat checks for scripted grab and refined single-hit drop kick
    _checkCombat() {
        if (this.currentAction === this.actions['special']) {
            return; // Purely scripted command grab interaction
        }
        
        // Refine combo2 (Flying Drop Kick) to deliver exactly 1 heavy hit and sound
        if (this.currentAction === this.actions['combo2']) {
            if (!this.isAttacking || this.hitCooldown > 0 || !this.opponent || !this.opponent._ready) return;
            
            const attackBone = this.hitboxes.footR;
            // Use pos-based fallback since bone world-pos is distorted by manualScale
            const kickDir = Math.sign(this.opponent.pos.x - this.pos.x);
            let attackPos;
            if (attackBone) {
                // Use normalised pos approach - immune to scale distortion
                attackPos = new THREE.Vector3(
                    this.pos.x + kickDir * 0.7,
                    this.pos.y + 0.6,
                    0
                );
            } else {
                // Reliable fallback estimated from character direction
                attackPos = this.model.position.clone();
                attackPos.y += 0.6;
                const dir = Math.sign(this.opponent.pos.x - this.pos.x);
                attackPos.x += dir * 0.8;
            }
            
            const targetPos = this.opponent.model.position.clone();
            targetPos.y += 1.0; // target mid-body
            
            const hitThreshold = 2.2; // generously scale for the flying kick lunge
            
            // Flatten vectors to 2.5D plane to prevent whiffing in the Z-depth!
            attackPos.z = 0;
            targetPos.z = 0;
            const dist = attackPos.distanceTo(targetPos);
            
            if (dist < hitThreshold) {
                console.log('[Debojeet] Heavy Flying Drop Kick CONNECTED!');
                
                // Deliver heavy 20 damage blow
                this.opponent.takeDamage(20, false);
                
                // Replenish mana and force massive cooldown to block multi-hits
                this.mana = Math.min(100, this.mana + 15);
                this._updateUI();
                this.hitCooldown = 99.0;
                
                // Strong knockback so Debojeet doesn't slide through opponent
                const kickDir = Math.sign(this.opponent.pos.x - this.pos.x);
                this.opponent.vel.x = kickDir * this.MOVE_SPEED * 2.2;
                this.vel.x = -kickDir * this.MOVE_SPEED * 0.5; // Recoil
                
                // Fire the proper heavy kick impact sound effect
                this.playSound('kick', 1.3);
            }
            return;
        }
        
        super._checkCombat();
    }

    // Spawn the devastating Inferno Fist fireball projectile
    spawnMagicProjectile(startPos) {
        this.projectiles.push(new InfernoFistAttack(this.scene, startPos, this.opponent, this));
    }

    onAnimationsLoaded() {
        super.onAnimationsLoaded();
        
        // Debojeet is a heavy Juggernaut. Make basic strikes slow and heavy!
        if (this.actions['punch']) {
            this.actions['punch'].setEffectiveTimeScale(0.85);
        }
        if (this.actions['combo1']) {
            this.actions['combo1'].setEffectiveTimeScale(0.85);
        }
        if (this.actions['combo2']) {
            this.actions['combo2'].setEffectiveTimeScale(2.0); // 2x speed for rapid impact
        }
        
        // Recover get-up actions faster
        if (this.actions['get_up']) {
            this.actions['get_up'].setEffectiveTimeScale(1.3);
        }
    }

    update(dt) {
        super.update(dt);
        
        // Active Frame scanning for diving command grab (checks distance continuously during dive!)
        if (this.isAttacking && this.currentAction === this.actions['special'] && !this.grabActive && !this.grabLockInitiated) {
            // Active diving phase where contact is validated
            if (this.attackTimer > 0.1 && this.attackTimer < 0.75) {
                if (this.opponent && !this.opponent.isDead) {
                    const isRyomen = this.opponent.config.name.toLowerCase().includes('ryomen');
                    const dist = Math.abs(this.opponent.pos.x - this.pos.x);
                    
                    // Lock-in distance threshold during active dive phase
                    if (dist <= 2.0 && !isRyomen) {
                        console.log('[Debojeet] <<< GRAB CONNECTED MID-DIVE >>>');
                        this.grabActive = true;
                        this.grabLockInitiated = true;
                        
                        // Firmly secure and stun opponent
                        this.opponent.isHit = true;
                        this.opponent.isAttacking = false;
                        this.opponent.fadeTo('hit_medium');
                        this.opponent.attackTimer = 0; // Reset victim timer to guarantee maximum stun period
                    } else if (dist <= 2.0 && isRyomen) {
                        console.log('[Debojeet] Command grab blocked mid-dive: Ryomen Immunity!');
                        this.grabLockInitiated = true; // Suppress scanning for the remainder of this attempt
                    }
                }
            }
        }
        
        // Command Grab update thread: Anchors victim's relative coordinates
        if (this.grabActive && this.opponent && !this.opponent.isDead) {
            // Lock victim exactly 0.8m in front of Debojeet
            const grabOffset = 0.8;
            const lookDir = this.attackDirection || (this.isPlayerOne ? 1 : -1);
            const targetX = this.pos.x + lookDir * grabOffset;
            
            // Smoothly lerp victim position to the grapple zone
            this.opponent.pos.x = THREE.MathUtils.lerp(this.opponent.pos.x, targetX, 12 * dt);
            
            // Dynamic trigonometric lift & slam parabola
            if (this.attackTimer > 0.4 && this.attackTimer < 1.05) {
                const progress = (this.attackTimer - 0.4) / 0.65; // normalized 0.0 - 1.0
                const liftHeight = 1.3; // Maximum meters peak lift
                this.opponent.pos.y = -3.0 + Math.sin(progress * Math.PI) * liftHeight;
            } else {
                this.opponent.pos.y = -3.0; // Standard floor bound
            }
            
            // Execute the slam impact exactly when it hits the floor
            if (this.attackTimer >= 1.05 && !this.slamTriggered) {
                this.slamTriggered = true;
                this.executeGrabSlam();
            }
            
            // Failsafe release if Debojeet takes damage or resets unexpectedly
            if (!this.isAttacking) {
                this.grabActive = false;
                this.opponent.pos.y = -3.0;
            }
        }
    }
}

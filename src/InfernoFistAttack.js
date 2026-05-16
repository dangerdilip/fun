import * as THREE from 'three';

export class InfernoFistAttack {
    constructor(scene, startPos, targetObj, attacker) {
        this.scene = scene;
        this.targetObj = targetObj;
        this.attacker = attacker;
        
        this.group = new THREE.Group();
        this.group.position.copy(startPos);
        this.group.position.y += 1.4; // Chest height
        
        this.scene.add(this.group);
        
        this.particles = [];
        this.active = true;
        this.age = 0;
        this.MAX_AGE = 3.5;
        
        this.hasHit = false;
        
        this._initVisuals();
    }
    
    _initVisuals() {
        // 1. Dense Burning Core Sprite
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        grad.addColorStop(0, '#ffffff'); // White hot center
        grad.addColorStop(0.2, '#ff9900'); // Intense orange
        grad.addColorStop(0.6, '#ff3300'); // Deep burning red
        grad.addColorStop(1.0, 'rgba(0,0,0,0)'); // Fades to black
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        
        const coreTex = new THREE.CanvasTexture(canvas);
        const coreMat = new THREE.SpriteMaterial({
            map: coreTex,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.coreSprite = new THREE.Sprite(coreMat);
        this.coreSprite.scale.set(3.5, 3.5, 3.5);
        this.group.add(this.coreSprite);

        // 2. Trailing ember particles
        const numParticles = 20;
        for (let i = 0; i < numParticles; i++) {
            const pMat = new THREE.SpriteMaterial({
                map: coreTex,
                color: 0xffaa44,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const pSprite = new THREE.Sprite(pMat);
            
            pSprite.userData = {
                velX: (Math.random() - 0.5) * 2.0,
                velY: (Math.random() - 0.5) * 2.0,
                velZ: (Math.random() - 0.5) * 2.0,
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
        if (this.age > this.MAX_AGE) {
            this.destroy();
            return;
        }
        
        // Pulsate and rotate core
        const pulse = 3.5 + Math.sin(this.age * 15) * 0.4;
        this.coreSprite.scale.set(pulse, pulse, pulse);
        
        // Update and recycle trailing embers
        this.particles.forEach(p => {
            p.userData.life += dt * 2.0;
            if (p.userData.life > 1.0) {
                // Reset to center
                p.position.set(0, 0, 0);
                p.userData.life = 0;
            }
            // Move backwards relative to forward velocity
            p.position.x += (p.userData.velX - 5.0 * (this.attacker.attackDirection || 1)) * dt;
            p.position.y += p.userData.velY * dt;
            p.position.z += p.userData.velZ * dt;
            
            // Fade and shrink over life
            const factor = 1.0 - p.userData.life;
            p.scale.set(0.6 * factor, 0.6 * factor, 0.6 * factor);
            p.material.opacity = factor * 0.8;
        });

        // Move in straight fast line
        if (!this.hasHit) {
            const speed = 18.0; // Extremely fast direct projectile
            this.group.position.x += (this.attacker.attackDirection || 1) * speed * dt;
            
            // Check collision with opponent
            if (this.targetObj && this.targetObj.model) {
                const targetPos = this.targetObj.model.position.clone().add(new THREE.Vector3(0, 1.5, 0));
                
                const attackPos = this.group.position.clone();
                attackPos.z = 0;
                const scanTargetPos = targetPos.clone();
                scanTargetPos.z = 0;
                
                const dist = attackPos.distanceTo(scanTargetPos);
                
                if (dist < 2.2) {
                    // Deal massive Juggernaut damage (28%) and knock down
                    this.targetObj.takeDamage(28, true);
                    this.hasHit = true;
                    
                    // Big explosion burst
                    this.coreSprite.scale.set(8.0, 8.0, 8.0);
                    this.particles.forEach(p => {
                        p.scale.set(2.5, 2.5, 2.5);
                        p.position.add(new THREE.Vector3(p.userData.velX * 5, p.userData.velY * 5, p.userData.velZ * 5));
                    });
                    
                    setTimeout(() => this.destroy(), 350);
                }
            }
        }
    }
    
    destroy() {
        this.active = false;
        this.scene.remove(this.group);
        this.coreSprite.material.map.dispose();
        this.coreSprite.material.dispose();
        this.particles.forEach(p => {
            p.material.dispose();
        });
    }
}

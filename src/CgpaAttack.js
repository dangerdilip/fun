import * as THREE from 'three';

export class CgpaAttack {
    constructor(scene, startPos, targetObj, attacker) {
        this.scene = scene;
        this.targetObj = targetObj; // Opponent character
        this.attacker = attacker; // The character casting the spell
        
        this.group = new THREE.Group();
        this.group.position.copy(startPos);
        // Start a bit higher
        this.group.position.y += 1.5;
        
        this.scene.add(this.group);
        
        this.particles = [];
        this.active = true;
        this.age = 0;
        this.MAX_AGE = 4.0; // Dies after 4 seconds
        
        this.hasHit = false;
        
        this._initVisuals();
    }
    
    _initVisuals() {
        // 1. Create the giant "9" core
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, size, size);
        
        ctx.font = 'Bold 200px Arial, sans-serif';
        ctx.fillStyle = '#ff3366'; // Pinkish-red energy
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Intense Glow
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 30;
        
        ctx.fillText('9', size/2, size/2);
        
        const coreTex = new THREE.CanvasTexture(canvas);
        const coreMat = new THREE.SpriteMaterial({
            map: coreTex,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.coreSprite = new THREE.Sprite(coreMat);
        this.coreSprite.scale.set(3.0, 3.0, 3.0); // Big 9
        this.group.add(this.coreSprite);

        // 2. Create orbiting protons (particles)
        const pSize = 32;
        const pCanvas = document.createElement('canvas');
        pCanvas.width = pSize;
        pCanvas.height = pSize;
        const pCtx = pCanvas.getContext('2d');
        
        // Draw glowing circle
        const cx = pSize/2, cy = pSize/2, r = pSize/4;
        pCtx.beginPath();
        pCtx.arc(cx, cy, r, 0, Math.PI*2);
        pCtx.fillStyle = '#ffffff';
        pCtx.shadowColor = '#00ffff'; // Cyan glow
        pCtx.shadowBlur = 10;
        pCtx.fill();
        
        const pTex = new THREE.CanvasTexture(pCanvas);
        
        const numParticles = 15;
        for (let i = 0; i < numParticles; i++) {
            const pMat = new THREE.SpriteMaterial({
                map: pTex,
                color: 0xffffff,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const pSprite = new THREE.Sprite(pMat);
            
            // Random orbit parameters
            pSprite.userData = {
                angle: Math.random() * Math.PI * 2,
                speed: 3 + Math.random() * 5,
                radius: 1.0 + Math.random() * 1.5,
                axisY: (Math.random() - 0.5) * 2
            };
            
            pSprite.scale.set(0.5, 0.5, 0.5);
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
        
        // Orbit logic for protons
        this.particles.forEach(p => {
            p.userData.angle += p.userData.speed * dt;
            p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
            p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
            p.position.y = p.userData.axisY * Math.sin(p.userData.angle * 2);
        });

        // Pulsate core "9"
        const pulse = 3.0 + Math.sin(this.age * 10) * 0.3;
        this.coreSprite.scale.set(pulse, pulse, pulse);

        // Movement toward target
        if (this.targetObj && this.targetObj.model) {
            const targetPos = this.targetObj.model.position.clone().add(new THREE.Vector3(0, 1.5, 0));
            const dir = new THREE.Vector3().subVectors(targetPos, this.group.position).normalize();
            
            this.group.position.add(dir.multiplyScalar(10 * dt)); // Faster than leetcode
            
            // Collision detection
            const attackPos = this.group.position.clone();
            attackPos.z = 0;
            const scanTargetPos = targetPos.clone();
            scanTargetPos.z = 0;
            
            const dist = attackPos.distanceTo(scanTargetPos);
            if (dist < 2.0 && !this.hasHit) {
                this.hasHit = true;
                
                // Explode effect before dying
                this.coreSprite.scale.set(6.0, 6.0, 6.0); // massive expansion
                this.particles.forEach(p => {
                    p.userData.radius += 5.0; // blast away
                });
                
                // Academic Immunity check: Ryomen Raj is entirely unaffected!
                if (this.targetObj && this.targetObj.immuneToAcademics) {
                    console.log('[CgpaAttack] Academic attack nullified against The King!');
                } else {
                    // Deal massive damage and true for isMagic (causes knockdown)
                    this.targetObj.takeDamage(25, true); 
                }

                setTimeout(() => this.destroy(), 300); // Quick destroy after hit
            }
        }
    }
    
    destroy() {
        this.active = false;
        this.scene.remove(this.group);
        
        this.coreSprite.material.map.dispose();
        this.coreSprite.material.dispose();
        
        this.particles.forEach(p => {
            p.material.map.dispose();
            p.material.dispose();
        });
    }
}

import * as THREE from 'three';

export class LeetcodeAttack {
    constructor(scene, startPos, targetObj, attacker) {
        this.scene = scene;
        this.targetObj = targetObj; // Opponent character
        this.attacker = attacker; // The character casting the spell
        
        this.group = new THREE.Group();
        this.group.position.copy(startPos);
        // Start a bit higher and forward
        this.group.position.y += 1.5;
        
        this.scene.add(this.group);
        
        this.particles = [];
        this.active = true;
        this.age = 0;
        this.MAX_AGE = 4.0; // Dies after 4 seconds
        
        this.hasHit = false; // Prevents multiple massive damage ticks instantly
        
        this._initSwarm();
    }
    
    _initSwarm() {
        const symbols = ['+', '-', '*', '/', '%', '<', '&', '^', '{', '}'];
        const count = 40;
        
        for (let i = 0; i < count; i++) {
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            const size = 64;
            
            // Programmatic Texture Generation
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#050505'; // transparent? No, make it fully transparent bg
            ctx.clearRect(0, 0, size, size);
            
            ctx.font = 'Bold 40px Consolas, monospace';
            ctx.fillStyle = '#00ffcc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Glow
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 10;
            
            ctx.fillText(sym, size/2, size/2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ 
                map: texture, 
                color: 0xffffff,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            
            const sprite = new THREE.Sprite(material);
            
            // Random spread
            sprite.position.set(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
            
            // Random velocity offset
            sprite.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5
            );
            
            sprite.scale.set(0.8, 0.8, 0.8);
            this.group.add(sprite);
            this.particles.push(sprite);
        }
    }
    
    update(dt) {
        if (!this.active) return;
        
        this.age += dt;
        if (this.age > this.MAX_AGE) {
            this.destroy();
            return;
        }
        
        // Swarm logic: Move group towards target
        if (this.targetObj && this.targetObj.model) {
            const targetPos = this.targetObj.model.position.clone().add(new THREE.Vector3(0, 1.5, 0));
            const dir = new THREE.Vector3().subVectors(targetPos, this.group.position).normalize();
            
            // Move group
            this.group.position.add(dir.multiplyScalar(8 * dt)); // Speed
            
            // Particle swarm internal movement
            this.group.rotation.y += 2 * dt;
            this.group.rotation.z += 1 * dt;
            
            this.particles.forEach(p => {
                // Chaotic movement
                p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
                // Pull back to center of group
                const toCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0,0,0), p.position);
                p.userData.velocity.add(toCenter.multiplyScalar(2 * dt));
            });
            
            // Collision detection
            const attackPos = this.group.position.clone();
            attackPos.z = 0;
            const scanTargetPos = targetPos.clone();
            scanTargetPos.z = 0;
            
            const dist = attackPos.distanceTo(scanTargetPos);
            if (dist < 2.0 && !this.hasHit) {
                this.targetObj.takeDamage(20, true); // Massive damage with knockdown
                this.hasHit = true; // Wait or just hit once
                
                // Explode effect before dying
                this.particles.forEach(p => {
                    p.userData.velocity.copy(p.position).normalize().multiplyScalar(15);
                });
                
                setTimeout(() => this.destroy(), 500); // Destroy shortly after hit
            }
        }
    }
    
    destroy() {
        this.active = false;
        this.scene.remove(this.group);
        this.particles.forEach(p => {
            p.material.map.dispose();
            p.material.dispose();
        });
    }
}

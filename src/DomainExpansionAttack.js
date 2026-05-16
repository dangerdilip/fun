import * as THREE from 'three';

export class DomainExpansionAttack {
    constructor(scene, startPos, targetObj, attacker) {
        this.scene = scene;
        this.targetObj = targetObj;
        this.attacker = attacker;
        
        this.group = new THREE.Group();
        this.group.position.copy(startPos);
        this.group.position.y += 1.5; 
        
        this.scene.add(this.group);
        
        this.active = true;
        this.age = 0;
        this.MAX_AGE = 4.5;
        this.hasHit = false;
        
        this._initVisuals();
    }
    
    _initVisuals() {
        // 1. Giant Procedural Void Mesh
        // Create a high-fidelity sphere with dark cursed-energy material
        const geom = new THREE.SphereGeometry(1, 32, 32);
        this.voidMat = new THREE.MeshBasicMaterial({
            color: 0x220044, // Dark void purple
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        this.voidSphere = new THREE.Mesh(geom, this.voidMat);
        this.voidSphere.scale.set(0.1, 0.1, 0.1);
        this.group.add(this.voidSphere);
        
        // 2. Cursed sigil wireframe
        const wireGeom = new THREE.IcosahedronGeometry(1.1, 2);
        this.wireMat = new THREE.MeshBasicMaterial({
            color: 0xff0044, // Crimson static energy
            wireframe: true,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending
        });
        this.wireSphere = new THREE.Mesh(wireGeom, this.wireMat);
        this.wireSphere.scale.set(0.1, 0.1, 0.1);
        this.group.add(this.wireSphere);
    }
    
    update(dt) {
        if (!this.active) return;
        
        this.age += dt;
        if (this.age > this.MAX_AGE) {
            this.destroy();
            return;
        }
        
        if (this.age < 1.2) {
            // Stay anchored to Ryomen Raj's model instead of moving forward
            if (this.attacker && this.attacker.model) {
                this.group.position.copy(this.attacker.model.position);
                this.group.position.y += 1.5; // Raise slightly to center
            }
            // Expand slightly while traveling/charging
            const s = 1.0 + this.age * 2;
            this.voidSphere.scale.set(s, s, s);
            this.wireSphere.scale.set(s*1.1, s*1.1, s*1.1);
            this.voidMat.opacity = Math.min(0.4, this.age);
            this.wireMat.opacity = Math.min(0.6, this.age);
        } else if (!this.hasHit) {
            // MASSIVE EXPANSION / DOMAIN ACTIVATE
            this.hasHit = true;
            
            // Fully center expansion around Ryomen
            if (this.attacker && this.attacker.model) {
                this.group.position.copy(this.attacker.model.position);
                this.group.position.y += 1.5;
            }
            
            // Scale burst!
            let expansionScale = 35.0; // Enormous dome filling full arena!
            
            new Promise((resolve) => {
                let current = this.voidSphere.scale.x;
                const steps = 20;
                let i = 0;
                const interval = setInterval(() => {
                    current += (expansionScale - current) * 0.3;
                    this.voidSphere.scale.set(current, current, current);
                    this.wireSphere.scale.set(current * 1.05, current * 1.05, current * 1.05);
                    this.voidMat.opacity = 0.7 * (1.0 - (i / steps));
                    this.wireMat.opacity = 0.9 * (1.0 - (i / steps));
                    i++;
                    if (i >= steps) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 30);
            }).then(() => {
                // Hit logic at the moment of explosion
                if (this.targetObj && this.targetObj.model) {
                    const attackPos = this.group.position.clone();
                    attackPos.z = 0;
                    const scanTargetPos = this.targetObj.model.position.clone();
                    scanTargetPos.z = 0;
                    
                    const dist = attackPos.distanceTo(scanTargetPos);
                    // Hit everything inside the massive dome!
                    if (dist < 25.0) {
                        // Devastating Chaos Sovereign damage (20%) and launch backward
                        this.targetObj.takeDamage(20, true); 
                    }
                }

                // >>> DELAYED RED ARENA ACTIVATION <<<
                // Trigger blood effects and transformation now that sphere filled the arena!
                if (this.attacker && typeof this.attacker.switchToDomain === 'function') {
                    this.attacker.switchToDomain();
                }

                setTimeout(() => this.destroy(), 500);
            });
        }
        
        // Spin both spheres constantly
        this.voidSphere.rotation.y += dt * 1.5;
        this.voidSphere.rotation.z -= dt * 0.8;
        this.wireSphere.rotation.y -= dt * 2.0;
        this.wireSphere.rotation.x += dt * 1.2;
    }
    
    destroy() {
        this.active = false;
        this.scene.remove(this.group);
        
        this.voidSphere.geometry.dispose();
        this.voidMat.dispose();
        
        this.wireSphere.geometry.dispose();
        this.wireMat.dispose();
    }
}

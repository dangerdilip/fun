export class AIBot {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty.toLowerCase();
        
        this.self = null;
        this.opponent = null;
        
        this.keys = {
            left: false, right: false, up: false, down: false,
            jump: false, punch: false, kick: false, special: false, magic: false
        };
        this.enabled = true;
        
        this.virtualComboSequence = null;
        
        // Difficulty tunings
        this.reactionTimer = 0;
        this.actionCooldown = 0;
        
        switch (this.difficulty) {
            case 'easy':
                this.reactionLatency = 0.45;
                this.evasionChance = 0.25;
                this.counterChance = 0.15;
                this.optimalRange = 3.5;
                break;
            case 'medium':
                this.reactionLatency = 0.22;
                this.evasionChance = 0.55;
                this.counterChance = 0.45;
                this.optimalRange = 2.5;
                break;
            case 'hard':
                this.reactionLatency = 0.075;
                this.evasionChance = 0.85;
                this.counterChance = 0.75;
                this.optimalRange = 1.8;
                break;
            default:
                this.reactionLatency = 0.3;
                this.evasionChance = 0.5;
                this.counterChance = 0.3;
                this.optimalRange = 2.5;
        }
    }
    
    // Duck-types InputManager.checkCombo
    checkCombo(sequence, timeWindow = 800) {
        if (!this.virtualComboSequence) return false;
        if (sequence.join(',') === this.virtualComboSequence.join(',')) {
            this.virtualComboSequence = null; // Consume combo
            return true;
        }
        return false;
    }
    
    _resetKeys() {
        for (let k in this.keys) {
            this.keys[k] = false;
        }
    }
    
    update(dt) {
        if (!this.enabled) {
            this._resetKeys();
            return;
        }
        if (!this.self || !this.opponent || this.self.isDead || this.opponent.isDead) {
            this._resetKeys();
            return;
        }
        
        this._resetKeys();
        
        if (this.actionCooldown > 0) {
            this.actionCooldown -= dt;
            if (this.actionCooldown > 0) return; // Still cooling down / committing to an action
        }
        
        const dist = Math.abs(this.opponent.pos.x - this.self.pos.x);
        const dirToOpponent = Math.sign(this.opponent.pos.x - this.self.pos.x); 
        
        const moveForward = dirToOpponent < 0 ? 'left' : 'right';
        const moveBackward = dirToOpponent > 0 ? 'left' : 'right'; // Corrected: if opponent is on right (dir=1), backwards is left!
        
        // 1. REACTION / EVASION Logic
        if (this.opponent.isAttacking) {
            this.reactionTimer += dt;
            if (this.reactionTimer >= this.reactionLatency) {
                // Time to react!
                if (Math.random() < this.evasionChance) {
                    this.keys[moveBackward] = true; // Back away
                    if (Math.random() < 0.5) this.keys.jump = true; // Jump away
                    this.actionCooldown = 0.4; // Commit to evasion
                    this.reactionTimer = 0;
                    return;
                } else if (Math.random() < this.counterChance && dist <= this.optimalRange + 1.0) {
                    // Counter attack!
                    this._executeAttack(dist, moveForward);
                    this.reactionTimer = 0;
                    return;
                }
                this.reactionTimer = 0; // Reset even if decided to do nothing (missed the counter window)
            }
        } else {
            this.reactionTimer = 0; 
        }
        
        if (this.self.isAttacking || this.self.isHit || this.self.isParalyzed) return;
        
        // 2. SPACING & NEUTRAL Logic
        const deadzone = 0.6; // Reverted for natural spacing
        if (dist > this.optimalRange + deadzone) {
            // Move closer
            this.keys[moveForward] = true;
            // Jump forward occasionally on higher difficulties to close gaps fast
            if (Math.random() < 0.02 && this.difficulty !== 'easy') this.keys.jump = true;
        } else if (dist < this.optimalRange - deadzone) {
            // Too close, retreat
            if (Math.random() < 0.2) { // Increased frequency of retreat for better spacing
                this.keys[moveBackward] = true;
            }
        } else {
            // In optimal range! Strike!
            const attackThreshold = this.difficulty === 'hard' ? 0.15 : (this.difficulty === 'medium' ? 0.05 : 0.02);
            if (Math.random() < attackThreshold) {
                this._executeAttack(dist, moveForward);
            }
        }
    }
    
    _executeAttack(dist, forwardKey) {
        const rand = Math.random();
        
        if (this.self.mana >= 100 && dist > 3 && rand < 0.8) {
            this.keys.magic = true; // Ultimate magic if far and max mana
        } else if (this.self.mana >= 50 && dist <= 2.8 && rand < 0.6) {
            this.keys.special = true; // Special / Command grab if close
        } else if (rand < 0.35 && this.difficulty !== 'easy') {
            // Execute Combo
            const combos = [
                ['right', 'punch', 'punch'],
                ['down', 'kick']
            ];
            this.virtualComboSequence = combos[Math.floor(Math.random() * combos.length)];
            // Hardcode directional combo inputs
            if (this.virtualComboSequence[0] === 'right' || this.virtualComboSequence[0] === 'left') {
                this.virtualComboSequence[0] = forwardKey; // Always do combo towards opponent
            }
        } else if (rand < 0.6) {
            this.keys.kick = true;
        } else {
            this.keys.punch = true;
        }
        
        // Cooldown between aggressive strings
        this.actionCooldown = this.difficulty === 'hard' ? 0.15 : (this.difficulty === 'medium' ? 0.4 : 1.0);
    }
}

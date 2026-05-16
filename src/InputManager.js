export class InputManager {
    constructor() {
        this.keys = {
            left:  false,
            right: false,
            up:    false,
            down:  false,
            jump:  false,
            punch: false,
            kick:  false,
            special: false,
            magic: false
        };
        this.enabled = true;

        this.history = [];
        this.HISTORY_LIMIT = 15;

        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup',   (e) => this._onKeyUp(e));
    }

    _onKeyDown(e) {
        if (!this.enabled) return;
        if (e.repeat) return; // Prevent holding down from spamming history
        let keyName = null;
        switch(e.key.toLowerCase()) {
            case 'a': this.keys.left  = true; keyName = 'left'; break;
            case 'd': this.keys.right = true; keyName = 'right'; break;
            case 'w': this.keys.jump  = true; keyName = 'up'; break;
            case 's': this.keys.down  = true; keyName = 'down'; break;
            case 'j': this.keys.punch = true; keyName = 'punch'; break;
            case 'k': this.keys.kick  = true; keyName = 'kick'; break;
            case 'u': this.keys.special = true; keyName = 'special'; break;
            case 'i': this.keys.magic = true; keyName = 'magic'; break;
        }

        if (keyName) {
            this.history.push({ key: keyName, time: performance.now() });
            if (this.history.length > this.HISTORY_LIMIT) {
                this.history.shift();
            }
        }
    }

    _onKeyUp(e) {
        if (!this.enabled) return;
        switch(e.key.toLowerCase()) {
            case 'a': this.keys.left  = false; break;
            case 'd': this.keys.right = false; break;
            case 'w': this.keys.jump  = false; break;
            case 's': this.keys.down  = false; break;
            case 'j': this.keys.punch = false; break;
            case 'k': this.keys.kick  = false; break;
            case 'u': this.keys.special = false; break;
            case 'i': this.keys.magic = false; break;
        }
    }

    checkCombo(sequence, timeWindow = 800) {
        if (this.history.length < sequence.length) return false;

        const now = performance.now();
        let seqIndex = sequence.length - 1;
        
        // Scan backwards through history
        for (let i = this.history.length - 1; i >= 0; i--) {
            const entry = this.history[i];
            
            // Too old? Combo failed
            if (now - entry.time > timeWindow) return false;
            
            if (entry.key === sequence[seqIndex]) {
                seqIndex--; // Found match, look for the next one backwards
                if (seqIndex < 0) {
                    // Combo successful! Clear history to prevent duplicate triggers
                    this.history = [];
                    return true;
                }
            }
        }
        return false;
    }
}

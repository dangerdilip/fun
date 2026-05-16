import { Character } from '../Character.js?v=49';
import { LeetcodeAttack } from '../LeetcodeAttack.js?v=49';

export class Harshita extends Character {
    constructor(scene, inputManager, config, isPlayerOne = true, loadingManager = null) {
        super(scene, inputManager, config, isPlayerOne, loadingManager);
    }

    spawnMagicProjectile(startPos) {
        this.projectiles.push(new LeetcodeAttack(this.scene, startPos, this.opponent, this));
    }

    onAnimationsLoaded() {
        super.onAnimationsLoaded();
        // Make Cartwheel (combo2) 2x faster for base Harshita
        if (this.actions['combo2']) {
            this.actions['combo2'].setEffectiveTimeScale(2.0);
        }
    }
}

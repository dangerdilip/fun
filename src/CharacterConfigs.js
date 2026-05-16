export const CHARACTER_CONFIGS = {
    'harshita': {
        name: 'Harshita',
        baseUrl: 'Assets/heroes/harshita/glb_harshita/',
        animations: {
            idle: 'Idle.glb',
            run: 'Jog Forward.glb',
            back: 'Walking Backward Arc Right.glb',
            jump: 'Jump.glb',
            punch: 'Jab Cross.glb',
            kick: 'Mma Kick.glb',
            special: 'Hurricane Kick.glb',
            magic: 'Standing 2H Magic Attack 01.glb',
            combo1: 'Hook.glb',
            combo2: 'Cartwheel.glb',
            victory: 'Thriller Part 3.glb',
            get_up: 'Situp To Idle.glb',
            hit_light: 'Light Hit To Head.glb',
            hit_medium: 'Medium Hit To Head.glb',
            ko: 'Knocked Out.glb'
        },
        sounds: {
            punch: 'Assets/sound/simple_punch_for_all.mp3',
            kick: 'Assets/sound/simple_kick_for_all.mp3',
            hit: 'Assets/sound/simple_punch_for_all.mp3',
            special: 'Assets/sound/tornado_kick.mp3',
            magic: 'Assets/sound/Leetcode_attack_special_move.mp3'
        },
        stats: {
            health: 100,
            mana: 10,
            moveSpeed: 6.5,
            jumpForce: 11.5
        }
    },
    'dummy': {
        name: 'Training Bot',
        baseUrl: 'Assets/heroes/harshita/glb_harshita/', // Reusing for now
        animations: {
            idle: 'Idle.glb',
            run: 'Jog Forward.glb',
            back: 'Walking Backward Arc Right.glb',
            jump: 'Jump.glb',
            punch: 'Jab Cross.glb',
            kick: 'Mma Kick.glb',
            special: 'Hurricane Kick.glb',
            magic: 'Standing 2H Magic Attack 01.glb',
            combo1: 'Hook.glb',
            combo2: 'Cartwheel.glb',
            victory: 'Thriller Part 3.glb',
            get_up: 'Situp To Idle.glb',
            hit_light: 'Light Hit To Head.glb',
            hit_medium: 'Medium Hit To Head.glb',
            ko: 'Knocked Out.glb'
        },
        sounds: {
            punch: 'Assets/sound/simple_punch_for_all.mp3',
            kick: 'Assets/sound/simple_kick_for_all.mp3',
            hit: 'Assets/sound/simple_punch_for_all.mp3',
            special: 'Assets/sound/tornado_kick.mp3',
            magic: 'Assets/sound/Leetcode_attack_special_move.mp3'
        },
        stats: {
            health: 100,
            mana: 10,
            moveSpeed: 6.5,
            jumpForce: 11.5
        }
    },
    'harshita_s': {
        name: 'Harshita_S',
        baseUrl: 'Assets/heroes/harshita_s/harshita_s_glb/',
        animations: {
            idle: 'Stand.glb',
            run: 'Medium Step Forward.glb',
            back: 'Injured Walk Backwards.glb',
            jump: 'Jump .glb',
            punch: 'Punching.glb',
            kick: 'Mma Kick.glb',
            special: 'Hurricane Kick.glb',
            magic: 'Magic Spell Casting.glb',
            combo1: 'Combo Punch.glb',
            combo2: 'Flying Knee Punch Combo.glb',
            victory: 'Magic Spell Casting.glb',
            get_up: 'Getting Up.glb',
            hit_light: 'Receive Uppercut To The Face.glb',
            hit_medium: 'Stunned.glb',
            ko: 'Dying.glb'
        },
        sounds: {
            punch: 'Assets/sound/simple_punch_for_all.mp3',
            kick: 'Assets/sound/simple_kick_for_all.mp3',
            hit: 'Assets/sound/simple_punch_for_all.mp3',
            special: 'Assets/sound/tornado_kick.mp3',
            magic: 'Assets/sound/9_CGPA_charge.mp3',
            combo: 'Assets/sound/Girl_combo_attack.mp3'
        },
        stats: {
            health: 100,
            mana: 10,
            moveSpeed: 6.0,
            jumpForce: 12.0
        },
        manualScale: 200
    },
    'debojeet': {
        name: 'Debojeet',
        baseUrl: 'Assets/heroes/debojeet/glb_debojeet/',
        animations: {
            idle: 'Bouncing Fight Idle.glb',
            run: 'Short Step Forward.glb',
            back: 'Drunk Walk Backwards.glb',
            jump: 'Jumping Up.glb',
            punch: 'Boxing.glb',
            kick: 'Martelo 2.glb',
            special: 'Double Leg Takedown - Attacker.glb',
            magic: 'Standing 2H Magic Attack 02.glb',
            combo1: 'Punch To Elbow Combo.glb',
            combo2: 'Drop Kick.glb',
            victory: 'Idle To Push Up.glb',
            get_up: 'Push Up To Idle.glb',
            hit_light: 'Receive Uppercut To The Face.glb',
            hit_medium: 'Stunned.glb',
            ko: 'Dying.glb'
        },
        sounds: {
            punch: 'Assets/sound/simple_punch_for_all.mp3',
            kick: 'Assets/sound/kick_effect_for_debojeet_and_ryomen.mp3',
            hit: 'Assets/sound/simple_punch_for_all.mp3',
            special: 'Assets/sound/Debojeet_combo.mp3',
            magic: 'Assets/sound/Fire_charge.mp3',
            combo: 'Assets/sound/Debojeet_combo.mp3'
        },
        stats: {
            health: 120, // Tanky Juggernaut HP
            mana: 10,
            moveSpeed: 5.5, // Slightly slower
            jumpForce: 11.0
        },
        manualScale: 220 // Scaled larger per request (+10)
    },
    'ryomen_raj': {
        name: 'Ryomen Raj',
        baseUrl: 'Assets/heroes/Ryomen_Raj/ryomen_basic/ryomen_basic_glb/',
        animations: {
            idle: 'Unarmed Idle.glb',
            run: 'Brutal To Happy Walking.glb',
            back: 'Walking Backward.glb',
            jump: 'Mutant Jumping.glb',
            punch: 'Elbow Uppercut Combo.glb',
            kick: 'Sword And Shield Kick.glb',
            special: 'Mutant Jump Attack.glb',
            magic: 'Standing 2H Magic Area Attack 02.glb',
            combo1: 'Knee Jabs To Uppercut.glb',
            combo2: 'Back Flip To Uppercut.glb',
            secret_art: 'One Hand Club Combo.glb',
            victory: 'Sitting Laughing.glb',
            get_up: 'Unarmed Idle.glb', // Quick transition
            hit_light: 'Standing Melee Attack Kick Ver. 1.glb', // Used as reactive
            hit_medium: 'Standing Melee Attack Kick Ver. 1.glb',
            ko: 'Sitting Laughing.glb' // Reused for death for now
        },
        sounds: {
            punch: 'Assets/sound/punch_for_Ryomen_Raj.mp3',
            kick: 'Assets/sound/kick_effect_for_debojeet_and_ryomen.mp3',
            hit: 'Assets/sound/punch_for_Ryomen_Raj.mp3',
            special: 'Assets/sound/Ryomen_combo_attack.mp3',
            magic: 'Assets/sound/Rymen_domain_expansion.mp3',
            combo: 'Assets/sound/Ryomen_combo_attack.mp3',
            domain_hum: 'Assets/sound/dark_aura.mp3',
            dark_aura_b: 'Assets/sound/dark_aura_b.mp3'
        },
        stats: {
            health: 100,
            mana: 10,
            moveSpeed: 7.0, // Chaos speed!
            jumpForce: 13.0
        },
        manualScale: 240 // Scaled larger per request
    },
    'ryomen_raj_domain': {
        name: 'Ryomen Raj (Domain)',
        baseUrl: 'Assets/heroes/Ryomen_Raj/ryomen_domain/ryomen_domain_glb/',
        animations: {
            idle: 'Happy Idle.glb',
            run: 'Dwarf Walk.glb',
            back: 'Unarmed Walk Back.glb',
            jump: 'Crouch To Standing Idle.glb',
            punch: 'Great Sword Casting.glb',
            kick: 'Sword And Shield Power Up.glb',
            special: 'Great Sword Casting.glb',
            magic: 'Sword And Shield Power Up.glb',
            combo1: '../../ryomen_basic/ryomen_basic_glb/Knee Jabs To Uppercut.glb',
            combo2: '../../ryomen_basic/ryomen_basic_glb/Back Flip To Uppercut.glb',
            victory: 'Happy Idle.glb',
            get_up: 'Crouch To Standing Idle.glb',
            hit_light: 'Sword And Shield Impact.glb',
            hit_medium: 'Sword And Shield Impact.glb',
            ko: 'Standing Idle To Crouch.glb'
        },
        sounds: {
            punch: 'Assets/sound/punch_for_Ryomen_Raj.mp3',
            kick: 'Assets/sound/kick_effect_for_debojeet_and_ryomen.mp3',
            hit: 'Assets/sound/punch_for_Ryomen_Raj.mp3',
            special: 'Assets/sound/Ryomen_combo_attack.mp3',
            magic: 'Assets/sound/Rymen_domain_expansion.mp3',
            combo: 'Assets/sound/Ryomen_combo_attack.mp3',
            domain_hum: 'Assets/sound/dark_aura.mp3',
            dark_aura_b: 'Assets/sound/dark_aura_b.mp3'
        },
        stats: {
            health: 100,
            mana: 10,
            moveSpeed: 7.0,
            jumpForce: 13.0
        },
        manualScale: 240, // Original correct size
        staticFootOffset: 'use_box' // Flawless visual grounding using geometric lowest point
    }
};

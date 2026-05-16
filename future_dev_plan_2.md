# 🚀 FRACTURE - Master Dev Plan 2: The Heavyweights & The Sovereign

This document serves as your definitive tactical overview for testing and refining our two new heavy-hitting roster entries: **Debojeet ("The Immovable")** and **Ryomen Raj ("The Unbound")**. 

*Status Update:* Both characters, their respective THREE.js classes, custom programmatic special attacks, and animation configurations have been **100% fully integrated** and registered into the engine. They are now fully playable in the arena!

---

## 🎮 1. HOW TO TEST THEM IMMEDIATELY (Dynamic URL System)

To enable rapid prototyping and zero-configuration testing, a **URL Query Engine** has been added to `Game.js`. You can now launch the game with ANY character combinations by running your server and simply loading the URL with parameters:

### 🔹 Run the server as normal:
```powershell
python server.py
```

### 🔹 Paste these special test links in your browser:
*   **Test Debojeet (P1) vs Bot (P2):**
    `http://localhost:8000/?p1=debojeet`
*   **Test Ryomen Raj (P1) vs Bot (P2):**
    `http://localhost:8000/?p1=ryomen_raj`
*   **Heavyweight Mirror Match:**
    `http://localhost:8000/?p1=debojeet&p2=debojeet`
*   **The Sovereign Clash:**
    `http://localhost:8000/?p1=ryomen_raj&p2=debojeet`

---

## 🛡️ 2. Character Details & Active Mappings

### 👨‍🎤 Debojeet — "The Immovable"
*   **Class:** `src/heroes/Debojeet.js`
*   **Archetype:** Grappler / Juggernaut. Slow, heavy, high impact.
*   **Active Move Mappings:**
    *   `U` (Punch): Boxing combo (`Boxing.glb`). *Slowed by 15% for heavy impact weight.*
    *   `I` (Kick): Martelo Kick (`Martelo 2.glb`).
    *   `O` (Special): Drop Kick (`Drop Kick.glb`).
    *   `J` (Combo 1): Punch-to-Elbow String (`Punch To Elbow Combo.glb`).
    *   `K` (Magic): **INFERNO FIST** (`Standing 2H Magic Attack 02.glb`). Spawns our new custom `InfernoFistAttack.js`.
    *   `Victory Stance`: Transitions from idle into direct push-ups (`Idle To Push Up.glb`).
    *   `Get Up Action`: Explodes from ground back to stance (`Push Up To Idle.glb`).
*   **Physics Calibration:** Base manualScale set to `200` for standard Mixamo profile. Max Health buffed to `120` (tank-tier).

### 👹 Ryomen Raj — "The Unbound"
*   **Class:** `src/heroes/RyomenRaj.js`
*   **Archetype:** Chaos Sovereign / Highest Combo Ceiling. Erratic, casual, lethal.
*   **Active Move Mappings:**
    *   `U` (Punch): Double Elbow Strike (`Elbow Uppercut Combo.glb`).
    *   `I` (Kick): Shield Piercer Kick (`Sword And Shield Kick.glb`).
    *   `O` (Special): Aerial Diving Attack (`Mutant Jump Attack.glb`).
    *   `J` (Combo 1): Knee-to-Jaw Strike (`Knee Jabs To Uppercut.glb`).
    *   `K` (Magic): **DOMAIN EXPANSION** (`Standing 2H Magic Area Attack 02.glb`). Spawns our new custom `DomainExpansionAttack.js`.
    *   `Victory Stance`: Casual, evil crouching laugh (`Sitting Laughing.glb`).
*   **🌌 Dual-Model Transformation Active (NEW!):** Ryomen Raj now **dynamically switches his entire 3D Mesh** to his Cursed Domain form (`ryomen_domain`) immediately upon executing his Magic domain expansion. 
    *   This includes dedicated Domain Form meshes, distinct shadow hierarchies, and independent animation mixers.
    *   He remains in this enhanced form for **exactly 5.0 seconds** before automatically reverting back to his basic form.
*   **Physics Calibration:** Base manualScale set to `200` for consistent skeleton scaling. Movement speed buffed to `7.0` (highest in roster).

---

## ✨ 3. Brand New Combat FX Implemented

Both characters leverage unique, purely programmatic Three.js particle and mesh effects for their magical abilities:

1.  **🔥 Inferno Fist (`src/InfernoFistAttack.js`):** Spawns a blinding white-hot core surrounded by layered orange-red CanvasTexture gradients. Trails dynamic embers that stream backward opposite to travel direction. Moves at a blistering `18.0 units/sec` and explodes on collision.
2.  **🔮 Domain Expansion (`src/DomainExpansionAttack.js`):** Spawns a dark purple volumetric void sphere and an overlapping crimson wireframe shell. Travels forward, then expands exponentially (`15x scale burst`) to engulf the opponent in a dark energy dome, dealing massive `35%` cursed area damage.

---

## 🗺️ 4. Future Tuning Roadmap (Next Steps)

Once you have tested their baseline animations and movement feel, our next phase will add their advanced master-design mechanics:

### **A. The Secret Art Combo Chain (Ryomen Raj)**
*   **Goal:** Implement his unique extended branch: pressing `J` a second time at the exact frame his base combo ends to trigger a seamless secondary sequence.
*   **Implementation:** Inside `RyomenRaj.js`, override the base `executeCombo` to cache a window timer (e.g. `this.comboWindowActive`). If `J` is detected within this window, chain directly to a third preset action.

### **B. The Ground-Bounce & Command Grab (Debojeet)**
*   **Goal:** Allow Debojeet's special grab (`Double Leg Takedown`) to trigger an inescapable sequence when inside `1.5m` distance.
*   **Implementation:** In `Debojeet.js`, override physical hit collision. If the special animation is playing, disable opponent physics and anchor their model coordinates directly to Debojeet's root bone for the duration of the slam.

### **C. Sound Stitches**
*   Hook up their dedicated character sound profiles inside `CharacterConfigs.js` once your AI generation for voices/sound FX is loaded into the `Assets/sound/` folder.

---
***
*Document formulated by Antigravity. Launch the URL links to begin combat certification.*

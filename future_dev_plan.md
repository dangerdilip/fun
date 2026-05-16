# 🚀 FRACTURE - Future Development Plan & Current State

This file contains the definitive technical status, known bugs, and step-by-step roadmap for the next phase of development. Use this document as the absolute source of truth for our current progress.

---

## 📋 1. Current Status Overview (Completed and Verified)

We successfully diagnosed underlying server issues (upgraded to `ThreadingTCPServer` to prevent browser connection lockups) and applied several major engine corrections:

*   **📐 Height Calibrated:** `Harshita_S`'s `manualScale` is set to `200.0` inside `CharacterConfigs.js` and is rendering perfectly balanced with the training bot.
*   **⚡ Magic Charge Up:** Added the requested `1.0s` charge delay to `spawnMagicProjectile` in `Character.js` for visceral combat feel.
*   **🥋 Combo Stabilization:** 
    *   Added physics momentum to `combo1` (`d+j+j`) so she lunges forward dynamically.
    *   Restored `combo2` (`s+k`) to natural `1.0x` speed for `Harshita_S`, ensuring it completes fully without rushing or early resets.
*   **📺 Anti-Jitter Renderer:** Changed WebGLRenderer precision to `'highp'` inside `Game.js`, permanently eliminating vertex shaking/glitches when running far from origin.
*   **🔄 Project-Wide Cache-Busting:** Incremented cache tag to `?v=40` in all script imports to force browsers to bypass aggressive module memory caching.

---

## ⚠️ 2. Active Bugs to Resolve (Next Session Priority)

### 🐛 Bug A: The "Sitting Stance" / Crouch-Loop (Harshita_S)
*   **Symptom:** Harshita_S repeatedly crouches or snaps to a hunched posture every 2 seconds and when returning to Idle.
*   **Root Cause:** The standard `Stand.glb` animation provided by Mixamo contains an internal crouching loop rotation rather than a high upright stance.
*   **🚫 Invalid Fix:** DO NOT point her `animations.idle` path to the base Harshita directory. This causes Three.js to load the wrong 3D skin mesh, swapping their identities!
*   **✅ Elegant Future Fix:** Keep her mesh file pointing to `Stand.glb` to preserve her unique skin, BUT inside `Harshita_S.js` override the animation clip: load base Harshita's `Idle.glb` and extract only the animation clip to assign to `this.actions['idle']`. This preserves her correct skin but plays the beautiful upright stance!

### 🐛 Bug B: Z-Axis Drift (Screen-Relative Drift)
*   **Symptom:** The character has started drifting "freely towards the screen" (Z-axis / depth direction) during specific movements or idle loops.
*   **Root Cause:** The root animation track (`mixamorigHips.position`) has non-zero translation keys on the Z-axis that are not being filtered, or the file's skeleton joint name is slightly off (e.g., `Pelvis` or `mixamorig:Hips`), bypassing our regex lock.
*   **✅ Fix:** Extend the `rootTrackPattern` inside `Character.js` to accommodate all bone naming conventions (`/mixamorigHips\.position|Hips\.position|mixamorig:Hips\.position|Pelvis\.position/i`) and ensure Z-axis clamping is applied firmly.

---

## 🗺️ 3. The 1-Day Master Roadmap (Action Plan)

Once the sitting/drifting glitches above are closed out, here is the master sequence to finish the game:

### **Step A: Complete the 4-Character Roster**
Add the two outstanding characters using the rigged assets already sitting in your drive:
1.  **Debojeet Setup:**
    *   *Assets:* `Assets/heroes/debojeet/glb_debojeet/`
    *   *Code:* Create `src/heroes/Debojeet.js` (subclass of `Character`).
    *   *Attack:* Implement `InfernoFistAttack.js` (flaming procedural fireball).
2.  **Ryomen Raj Setup:**
    *   *Assets:* `Assets/heroes/Ryomen_Raj/ryomen_basic/ryomen_basic_glb/`
    *   *Code:* Create `src/heroes/RyomenRaj.js`.
    *   *Attack:* Implement `DomainExpansionAttack.js` (massive procedural visual dome effect).

### **Step B: Build the Local Combat AI**
Create a simple but reactive AI Controller for Player 2 so the game can be played solo:
1.  **AI File:** Build `src/AiInputManager.js` with basic states: `APPROACH`, `RETREAT`, `ATTACK`, and `CAST_SPELL`.
2.  **Execution:** Instantiate `AiInputManager` inside `Game.js` and assign it to `player2`.
3.  **Dynamics:** Program the AI to randomly trigger combos, guard, or use magic when distance permits.

### **Step C: Free Deployment Stage**
Compile the game assets to make them shareable with your friends for free:
*   **Option 1: GitHub Pages:** Highly stable, directly serves from your repo.
*   **Option 2: Netlify:** Simply drag-and-drop the `fun` project directory for an instant, live URL.

---

## 🛠️ 4. Technical Dev Server Notice
The dev server must be run via:
```powershell
python server.py
```
It now runs as a **multi-threaded server** (`ThreadingTCPServer`). This guarantees that even with aggressive browsers loading multiple high-res GLB meshes concurrently, the system never hangs or serves corrupt caches again.

***

*Drafted with absolute technical precision. Review this file first when starting the next session.*

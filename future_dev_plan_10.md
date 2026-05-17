# FRACTURE: FUTURE DEVELOPMENT PLAN 10 (MASTER LOG)

## 🚀 Project Overview
**Fracture** is a high-fidelity 3D Web Fighting Engine built with Three.js. This log serves as the master record for deployment, repository management, and core technical milestones.

## 🔗 Live Deployment & Repository
- **Vercel URL:** [https://fun-phi-weld.vercel.app/](https://fun-phi-weld.vercel.app/)
- **GitHub Repo:** [https://github.com/dangerdilip/fun.git](https://github.com/dangerdilip/fun.git)
- **GitHub Username:** `dangerdilip`
- **GitHub Email:** `mrhellboy1234@gmail.com`

---

## 🛠️ Diagnosed Issues & Planned Fixes (Pending Action)

During thorough diagnostic testing on May 17, 2026, two critical bugs were isolated that cause gameplay freezes during local matches:

### 1. Easy Mode AI "Friction Freeze" (Why the AI Stops Moving)
* **Status:** Diagnosed & Documented.
* **Location:** `src/AIBot.js` ([AIBot.js](file:///c:/Users/KIIT0001/Desktop/fun/src/AIBot.js#L57-L79))
* **The Issue:** 
  The AI bot clears all of its virtual controller keys via `_resetKeys()` at the start of its update loop. If an `actionCooldown` is active, it decrements the timer and performs an early `return`.
  Because it returns early *after* clearing the keys, **it releases all movement keys completely** during the cooldown!
  On **Easy difficulty**, the cooldown is set to **`1.0` second** (compared to `0.15`s on Hard). Because friction in the physics system is extremely high (`FRICTION = 50.0`), the bot's velocity immediately drops to zero, causing the character to freeze completely for 1 second after every single attack or dodge attempt.
* **Planned Fix:** 
  Refactor the update loop in `src/AIBot.js` to separate tactical aggression/combo cooldowns from basic movement spacing controls so that the AI continues holding down movement keys (to advance/retreat) naturally during recovery phases.

### 2. Ryomen Raj's Animation & Input State Lock (Why the Player Gets Stuck)
* **Status:** Diagnosed & Documented.
* **Location:** `src/heroes/RyomenRaj.js` ([RyomenRaj.js](file:///c:/Users/KIIT0001/Desktop/fun/src/heroes/RyomenRaj.js)) and `src/Character.js` ([Character.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Character.js#L366-L377))
* **The Issue:**
  Player movement and attacks are guarded by active combat states (`isAttacking`, `isHit`). Normally, when an attack animation completes, the Three.js mixer triggers a `'finished'` event, which resets `isAttacking = false` and restores input control.
  However, when Ryomen Raj activates his **Domain Expansion**, his active mixer `this.mixer` is dynamically swapped from `this.basicMixer` to `this.domainMixer`.
  The core `'finished'` animation listener is only bound to the initial basic mixer during setup in `Character.js`. When the mixer is swapped during transformation, completed domain attacks fail to fire the finish handler on the core listener, trapping the player permanently in `isAttacking = true` or `isHit = true` states. Once locked, the player character can no longer move, punch, kick, or respond to any keypresses.
* **Planned Fix:**
  Bind explicit event listeners to both basic and domain mixers during initialization, and ensure form switching methods (`switchToDomain` / `switchToBasic`) safely synchronize active animation handlers. Add an extra timeout/frame fallback in `Character.js` to dynamically force state recovery if any transition is interrupted.

---

## 🛠️ Current Status & Major Fixes (Completed)
1. **Stabilized Physics:** 
   - Fixed the "magnetic" character sliding glitch.
   - Implemented 0.5/0.5 collision separation logic.
   - Expanded Arena Boundaries to 25.0 units.
2. **Multi-Stage Loading System:**
   - **Phase 1:** Initial preloader for core assets (Models/UI).
   - **Phase 2:** 13 High-Definition Cinematic Clips (Optimized via Streaming).
   - **Phase 3:** Theme & Mode selection.
   - **Phase 4:** Hero Selection (3D Preview).
   - **Phase 5:** Final Match Initialization.
3. **Vercel Compatibility (Case Sensitivity):**
   - Standardized all asset paths to `Assets/` (Uppercase) to ensure themes and audio load correctly on Linux-based Vercel servers.
4. **Performance Optimization:**
   - **3D Engine Hibernation:** The engine now pauses rendering during menus (Phases 1-3) to allow smooth 4K background video playback.
   - **Video Streaming:** Switched from Blob-preloading to native browser streaming for all 13 cinematics to prevent RAM lag.

---

## 🛰️ Workflow: Pushing Changes to Vercel
To update the live website from the Antigravity terminal, follow these steps:

1. **Stage Changes:**
   `git add .`
2. **Commit Changes:**
   `git commit -m "Describe your changes here"`
3. **Push to GitHub:**
   `git push origin main --force`
   *(Vercel will detect the push and redeploy automatically within 120 seconds).*

---

## 📁 Key File Map
- `src/Game.js`: The heart of the engine (Initialization, Loading Flow, Phase Management).
- `src/Character.js`: Movement, Physics, and Collision logic.
- `src/ArenaManager.js`: Handles Arena Themes (Ruins, Indian, Chinese) and UV Parallax.
- `src/AudioManager.js`: Manages Theme-specific music and sound effects.
- `index.html`: UI Layers, CSS overlays, and Loading screens.

---

## 📅 Next Development Goals
- [ ] Implement **Multiplayer Mode** (WebSockets/P2P).
- [ ] Add **Dynamic Weather Effects** to the Indian/Chinese arenas.
- [ ] Implement **Draco Compression** to reduce the 500MB asset footprint to ~80MB for faster initial loading.
- [ ] Enhance Combat SFX (Hit-based sound triggers).

**Last Updated:** May 17, 2026
**Status:** STABLE & DEPLOYED (Diagnostics Pending Later Action)

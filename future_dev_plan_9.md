# FRACTURE: FUTURE DEVELOPMENT PLAN 9 (MASTER LOG)

## 🚀 Project Overview
**Fracture** is a high-fidelity 3D Web Fighting Engine built with Three.js. This log serves as the master record for deployment, repository management, and core technical milestones.

## 🔗 Live Deployment & Repository
- **Vercel URL:** [https://fun-phi-weld.vercel.app/](https://fun-phi-weld.vercel.app/)
- **GitHub Repo:** [https://github.com/dangerdilip/fun.git](https://github.com/dangerdilip/fun.git)
- **GitHub Username:** `dangerdilip`
- **GitHub Email:** `mrhellboy1234@gmail.com`

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

**Last Updated:** May 16, 2026
**Status:** STABLE & DEPLOYED

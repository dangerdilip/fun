# Future Dev Plan 6: Polish Phase & Optimization

## 1. Recent Achievements (The "Crunchy" Update)
*   **Refined Push Mechanics:**
    *   Implemented a **Kinetic Split Resolver** that handles character collisions smoothly.
    *   **Wall Awareness:** Characters now respect the `18.0` boundary perfectly. If an opponent is pinned to the wall, the attacker is correctly blocked from clipping through them.
    *   **Zero-Sinking Guarantee:** Fixed the "sinking dwarf" and "arena floor" bugs by locking collision math to the X-axis, ensuring `_footOffset` remains stable.
*   **Dynamic Audio Overhaul:**
    *   **Swing vs. Hit:** Separated attack "whooshes" (on startup) from "impact" sounds (on connection).
    *   **Conditional Combo Audio:** Combo voice lines and special sounds now ONLY play if the attack connects.
    *   **Audio Interruption:** Implemented a "Combat Stop" system where persistent sounds (combos/specials) are immediately silenced if the character is hit or interrupted.
*   **Arena Synchronization:** Updated `ArenaManager` to match the full `18.0` movement range, ensuring the parallax background panning is perfectly calibrated to the stage limits.

## 2. Next Steps: UI & Interface Overhaul
*   **Premium Health Bars:** Redesign the HUD to use sleek gradients, glow effects, and "shake" animations when taking heavy damage.
*   **Character Selection Screen:** Upgrade the selection UI with vibrant character portraits, stats (Speed/Power/Health), and smooth transitions.
*   **Victory/Defeat Screens:** Add more "drama" to the end-game screen with animated text and blurred background effects.

## 3. Next Steps: Audio & Engine Refinement
*   **Global Music Manager:** Implement background music that dynamically crossfades (lower volume during combat, higher volume in menus).
*   **Combo Movement Fixes:** Investigate and fix cases where characters might get "stuck" during specific combo animations (Combo 1/Combo 2).
*   **Environmental SFX:** Add subtle ambient sounds (wind, fire, or arena-specific hums).

## 4. Final Optimization & Deployment
*   **Draco Compression:** Shrink the large `.glb` character models by up to 80% to ensure the game loads instantly on mobile and slow connections.
*   **Performance Profiling:** Optimize the `three.js` render loop to maintain a steady 60FPS even during complex magic effects.
*   **Hosting:** Prepare for launch on **Vercel** or **GitHub Pages**.

---
**Current Status:** Core mechanics and audio feedback are stable. Moving into the "Visual Wow Factor" phase.

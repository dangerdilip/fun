# Future Development Plan 8: Arena Finalization & Stabilization

## Current Status & Diagnosis
Following a live browser-based diagnosis, several critical issues persist in the new Theme Selection system that must be resolved before the next phase of development.

### 1. The "Magnet" Bug (Physical Attraction)
- **Status**: Confirmed. Characters are physically pulled together even with zero player input.
- **Diagnosis**: 
    - The AI "Optimal Range" logic (especially on Hard) is extremely aggressive, forcing P2 to stay glued to P1.
    - Potential "Root Motion" stripping failure in certain animations (like walk/idle cycles) causing the mesh to drift away from its logical hitbox.
    - Euler Integration instability during frame-rate fluctuations causing the collision resolver to "jitter" characters inward.

### 2. Performance Degradation (Chinese Arena)
- **Status**: Heavy lag and high loading times (~12s).
- **Diagnosis**: 
    - Texture memory footprint of 4K assets is high.
    - Redundant background scaling updates are occurring every frame during camera lerping.
    - Logic for pausing menu videos may be incomplete or failing during specific transitions.

### 3. Arena Spatial Feeling ("Low Space")
- **Status**: The arena feels cramped despite increasing the logical wall boundaries.
- **Diagnosis**: 
    - The Camera Zoom Cap is too restrictive (currently fixed at 30, but may need dynamic scaling based on character height).
    - Parallax depth values for the Indian/Chinese planes need better calibration to give a sense of vastness.

---

## Immediate Roadmap (Next Session)

### Phase 1: Arena Physics & Panning Fix
- [ ] **Stabilize Attraction**: Refactor `AIBot.js` to introduce a "Deadzone" in the optimal range so characters aren't constantly vibrating against each other.
- [ ] **Hard-Lock Root Motion**: Re-verify and strengthen the `rootTrack` locking in `Character.js` to ensure 0.00% drift on the X/Z axis for ALL animation clips.
- [ ] **Parallax Recalibration**: Update `ArenaManager.js` to use an "Exponential Parallax" curve, making the background move less as characters separate, increasing the feeling of scale.

### Phase 2: High-Performance Asset Handling
- [ ] **Lazy Loading**: Implement incremental texture loading for arena themes so the "Chinese" theme doesn't block the UI thread for 12 seconds.
- [ ] **Update Throttling**: Throttle `ArenaManager.update()` to 30Hz while keeping gameplay at 60Hz+ to reduce CPU overhead.

### Phase 3: Online Deployment Preparation
- [ ] **Production Build**: Optimize the asset pipeline for web deployment.
- [ ] **Multiplayer Placeholder**: Finalize the "Multiplayer" button logic to at least show a "Coming Soon" or "Connect" modal.

---

## Technical Notes for Resume
- Reference `src/Character.js` for the collision resolver.
- Reference `src/AIBot.js` for optimal range settings.
- Reference `src/ArenaManager.js` for the `yOffset` and `zoom` logic.

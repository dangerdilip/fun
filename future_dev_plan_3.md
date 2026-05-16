# 🚀 FRACTURE - Master Dev Plan 3: Movement Calibration & Mechanical Tuning

This document serves as the definitive tactical roadmap for our next session. It details immediate troubleshooting objectives for **Debojeet ("The Immovable")**'s locomotion and sets the stage for deeper engine stabilization after the planned system reboot.

---

## 🛠️ 1. EMERGENCY OBJECTIVE: Locomotion Diagnostics

Upon scaling **Debojeet** to **210**, instability has been reported during walking/locomotion states. 

### 🔎 Symptoms:
- Glitchy / jerky visual stuttering during basic forward/backward horizontal movement.
- Potential sliding or clipping artifacts.

### 🔬 High-Probability Diagnoses to Verify:
1. **Walk Timescale Sync**: Debojeet's moveSpeed is configured to `5.5` (tank tier). If his walk animation (`Walk.glb`) plays at default `1.0` timescale, the mismatch between visual leg stride and programmatic X-velocity triggers "foot skating" and jerkiness.
2. **Animation Weight Blending**: In `Character.js#update()`, the transition from `idle` to `walk` might be flickering due to velocity thresholds.
3. **Dynamic Ground Snapping**: Debojeet has a customized `manualScale` of `210`. While the `_footOffset` recomputes accurately at load time, any tiny Y-position fluctuations during walk-cycle keyframes may trigger ground collision snapping loops in Rapier or Three.js.

### ⚡ The Next Fix Action:
In our next session, we will implement:
- Smooth weight-based linear interpolation (lerp) for locomotion transitions.
- A locomotion timescale adjustment factor (e.g., `walkTimeScale = moveSpeed / constant`) inside `Debojeet.js#onAnimationsLoaded()`.

---

## 🤼 2. Active Debojeet Move Calibration (As Executed)

To ensure total continuity, here are the definitive, newly deployed mappings currently active in your system:

*   **`U` Key (Special)**: **Silent Flying Drop Kick** (`Drop Kick.glb`).
    *   *Startup Sound*: SILENT (whoosh sound completely stripped per your instruction).
    *   *Impact Sound*: Plays **ONLY** the heavy `kick_effect_for_debojeet_and_ryomen.mp3` exactly upon bone-to-mesh contact!
*   **`S+K` Keys (Combo 2)**: **Paralyzing Double Leg Takedown** (`Double Leg Takedown - Attacker.glb`).
    *   *Lockdown Mechanics*: Opponent is anchored, lifted, and slammed for 28 HP.
    *   *Ground Paralysis*: The opponent's auto-recovery time is disabled. They remain **frozen flat on the floor indefinitely**!
    *   *OTG Wakeup*: Hitting the paralyzed opponent with any new strike immediately shatters the lock and triggers their standard `get_up` animation.

---

## 🗺️ 3. Next-Phase Combat Goals

Once the Locomotion Diagnostics are complete, the roadmap expands to:

### **A. Camera Cinematic Overrides**
- **Goal**: Anchor or zoom the viewport camera dynamically during Debojeet's ground slam or Ryomen's Void Ball expansion to emphasize the heavy impact frames.

### **B. Arena Barrier Edge Stability**
- **Goal**: Prevent physics glitches if Debojeet tackle-grabs an opponent against the absolute boundary edge of the map. Add explicit vector clamping before triggering the command grab.

### **C. Advanced Audio Mix**
- Add specific arena environmental reverb triggers when the domain forms are active.

---
***
*Plan formulated and cached by Antigravity. This file is persisted and fully accessible as the primary briefing document for our next deployment session. Enjoy your system reboot!*

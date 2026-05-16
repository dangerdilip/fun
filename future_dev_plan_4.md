# FRACTURE - Future Development Plan 4

This document serves as a checkpoint and roadmap for development immediately following the system restart.

## ✅ Current Progress & Recent Fixes
We have successfully stabilized the core fighting mechanics and introduced a fully autonomous gameplay loop. The following major milestones were completed:

### 1. Combat Mechanics & Glitch Resolution
* **Debojeet's Command Grab (U)**: Rewritten to use **Active Frame Continuous Hitbox Scanning**. The dive now connects flawlessly mid-air and accurately tracks distance without "hitting blank space".
* **S+K Drop Kick**: Fixed the multi-hit glitch. The attack now correctly delivers a single, heavy 20-damage hit with a single sound effect. The animation speed was increased to **2.0x** for snappier impact.
* **Early Stand-up Bug**: Patched a deep Three.js `AnimationMixer` flaw where faded-out background animations triggered early state resets. Opponents now stay paralyzed and flat on the ground until the exact end of their hit-stun duration.
* **Z-Axis Stage Drift**: Eliminated lateral drifting caused by residual root motion in Mixamo animations. Characters remain perfectly anchored to their 2.5D depth plane.

### 2. Autonomous 1v1 AI System
* **Difficulty Selection Menu**: Game asset loading is now paused at startup to present a sleek glassmorphic modal asking the user to select AI Intensity (🟢 EASY, 🟡 MEDIUM, 🔴 HARD).
* **HUD Integration**: The selected difficulty is dynamically displayed as a badge above Player 2's health bar.
* **Duck-Typed Brain (`AIBot.js`)**: Implemented a non-intrusive Finite State Machine that mimics the `InputManager`. The AI calculates distance, reacts to attacks based on scaled latencies (down to 75ms on Hard), and executes combos and evasive jumps natively.
* **Dynamic Victory UI**: The victory screen now correctly displays proper grammar (`YOU WIN!` / `YOU LOSE!`) relative to Player 1.

---

## 🚀 Future Implementation & Next Steps

When we resume development, we will focus on the following core areas:

### 1. AI Tuning & Polish
* **Playtest Calibration**: Manually playtest against the `Hard` AI. We may need to tweak the `reactionLatency` (currently 75ms) or `evasionChance` (currently 85%) if the AI feels *too* invincible, or increase aggressiveness if it's too passive.
* **AI Combo Logic**: Expand the `AIBot.js` combo library to include character-specific special chains rather than generic inputs.

### 2. Visual Effects (VFX) & Audio
* **Impact Sparks & Shakes**: Add localized particle bursts and camera screen-shake during heavy impacts (like Debojeet's grab slam or S+K drop kick) to amplify the "weight" of the hits.
* **Audio Layering**: Introduce environmental sounds, crowd cheers, or announcer voice-overs for the "YOU WIN" screen.

### 3. Backlog Features
* **AI vs. AI Spectator Mode**: (Previously deferred). Introduce a toggle or URL parameter to assign `AIBot` instances to both Player 1 and Player 2 for zero-player simulation matches.
* **Character Roster Polish**: Finalize any remaining animations or hitbox sizing for Ryomen Raj or Harshita_S.

---
**Status**: Ready for PC Restart. Load this document upon return to immediately sync context.

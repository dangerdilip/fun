# ⚔️ Fracture: Future Development Plan 11
## Advanced Telemetry, Client Performance & Error Tracking Roadmap

This plan outlines the next phase of production tracking for *Fracture*. Leveraging our custom serverless logs bypass (`/api/track`), these features will monitor the game's actual runtime health, balance, and responsiveness in production for 100% free.

---

## 1. FPS & Performance Telemetry
**Goal:** Track real-world frame rates (FPS) of active players to identify performance bottlenecks on weaker devices (laptops, mobile phones).

### Architecture
- **In-Game Collector:** Maintain a rolling average of frame times during combat inside the rendering loop (`src/Game.js`).
- **Telemetry Payload:** At the end of a match, compile the average and minimum FPS along with basic system capabilities (WebGL renderer name, screen dimensions).
- **Trigger point:** Ping `/api/track` when the victory/defeat screen is displayed.

### Example Log Output
```text
📊 [GAME PERFORMANCE] Avg FPS: 58 | Min FPS: 42 | GPU: Apple M1 | OS: macOS | Player: Ranchi, JH, IN
```

---

## 2. Skill & Combo Balancing Analytics
**Goal:** Gather hard statistics on which special moves and combos are actually chosen and executed during real fights.

### Architecture
- **Skill Interceptor:** Whenever a character executes a special attack (e.g. `Ryomen Raj's Domain Expansion`, `Debojeet's Ground Grab`, `Harshita's Inferno Fist`), trigger a non-blocking tracking call.
- **Cool-Down Protection:** Throttle tracking events (e.g., maximum 3 logs per skill per match) to keep traffic lightweight and within Vercel's limits.

### Example Log Output
```text
🎮 [GAME EVENT] Event: SKILL_USED | Info: {"character":"ryomen_raj", "skill":"domain_expansion"} | Player: Ranchi, JH, IN
```

---

## 3. Automatic Error & Crash Reporting
**Goal:** Catch and report asset loading glitches (broken models, audio loading blockers) and Javascript execution crashes before they ruin the player's experience.

### Architecture
- **Global Error Boundary:** Bind `window.onerror` and `window.onunhandledrejection` to catch unexpected Javascript runtime errors.
- **Preloader Error Interceptor:** In the asset loader (`src/Game.js`), if a GLB model or MP4 background video fails to fetch, capture the path and error message.
- **Reporting:** Send a crash payload containing the error message, source file, line number, and player location.

### Example Log Output
```text
🚨 [GAME ERROR] File: src/Game.js | Line: 293 | Error: Failed to parse GLB 'ryoumen_animation.glb' | Player: Ranchi, JH, IN
```

---

## 📋 4. Telemetry Implementation Status (Completed & Fully Integrated)

We have successfully implemented and verified all advanced client performance, error tracking, and analytics hooks:

*   **📊 FPS & Performance Loop:** Integrated frame-timing metrics directly in the core rendering loop (`src/Game.js`). Samples combat frame rates during matches, computes average & minimum FPS (excluding startup spikes), and bundles them with real-world WebGL GPU names and screen configurations, pinging `/api/track?event=game_performance` on match end.
*   **🚨 Global Crash & Promise Boundary:** Expanded JavaScript error interceptors inside the entry point (`index.html`) using robust `window.onerror` and `window.onunhandledrejection` boundaries to seamlessly track uncaught exceptions and rejected promises.
*   **🔌 Active Asset-Fetch Guard:** Wrapped loading steps and model caches (gltf loaders and parallel blob preloaders) inside `src/Game.js` and `src/Character.js` with comprehensive try/catch tracking handlers, logging preloader fetches and parsing failures immediately.
*   **🎮 Combat Move & Skill Balancing:** Added per-match debounced skill tracking inside the attack engine `src/Character.js` when special, magic, and combo moves are triggered, keeping telemetry lightweight and capped at a maximum of 3 events per skill per match.
*   **🎨 High-Fidelity Omnilogs Integration:** Upgraded the administrative dashboard `logs.html` with bespoke CSS class styles, custom icons, and visual color highlights for performance and crash telemetry, allowing simple filtering and administrative reviews.

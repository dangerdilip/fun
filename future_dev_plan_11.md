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

## 4. Next Implementation Steps
1. **Performance Loop:** Implement a frame counter using `requestAnimationFrame` inside the game loop to track elapsed times and compute FPS.
2. **Global Error Listener:** Add the `window.addEventListener('error')` hook in `index.html` to direct uncaught crashes to `/api/track?event=client_crash`.
3. **Skill Event Hooks:** Integrate the track pings inside `src/heroes/` classes under their respective attack trigger methods.

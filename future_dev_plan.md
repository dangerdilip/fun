# 🚀 FRACTURE: Unified Master Development Plan & Progress Log

This file serves as the definitive master technical record and progress log for *Fracture*. It consolidates all past achievements, diagnosed glitches, saved optimization ideas, and long-term blueprints into a single, unified source of truth.

---

## 🔗 Live Production & Repo Assets
*   **Live Production URL:** [https://fun-phi-weld.vercel.app/](https://fun-phi-weld.vercel.app/)
*   **Administrative Omnilogs Dashboard:** [https://fun-phi-weld.vercel.app/logs.html](https://fun-phi-weld.vercel.app/logs.html)
*   **GitHub Repository:** [https://github.com/dangerdilip/fun.git](https://github.com/dangerdilip/fun.git)

---

## 📋 1. Core Milestones (Completed & Deployed)

### Phase A: Fighting Engine Physics & Collision (Stable)
*   **Magnetic Slide Fix:** Eliminated the persistent floor-sliding and drift bugs during active combat.
*   **Push Collision Physics:** Implemented strict `0.5 / 0.5` boundary repulsion logic inside the collision solver, permanently preventing characters from clipping or merging into each other.
*   **Boundary Calibration:** Expanded and locked invisible arena walls at `±25.0` units.
*   **Precision Rendering:** Configured High-Precision shaders (`highp`) inside the Three.js renderer, curing vertex jittering/shaking when players move far from the canvas origin.

### Phase B: Advanced Multi-Stage Asset Loading (Stable)
*   **Engine Hibernation:** Suspended active rendering loops during initial selection phases to reserve full GPU/CPU power for cinematic rendering.
*   **Dynamic Preloading:** Created a percentage-based, parallel asset cache mechanism inside [Game.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Game.js) mapping and loading all essential UI, sound, and rigs.
*   **Native Video Streaming:** Switched background previews from memory blobs to browser native streams, freeing 100MB+ of RAM and eliminating transition stutter.

### Phase C: Edge Geolocation & Logging Database (Stable)
*   **Serverless DB Connection:** Set up a lightweight Redis bypass middleware inside [api/_db.js](file:///c:/Users/KIIT0001/Desktop/fun/api/_db.js) using atomic REST queries to a free Vercel KV (Upstash) database instance.
*   **Smart Geolocator:** Developed Edge Header sniffers in [api/locate.js](file:///c:/Users/KIIT0001/Desktop/fun/api/locate.js) and [api/track.js](file:///c:/Users/KIIT0001/Desktop/fun/api/track.js) that capture geographic parameters (Country, Region, City) using raw Vercel IP headers (successfully tracking visitors from Ranchi, JH, IN).
*   **Glassmorphic Administrative Console:** Deployed [logs.html](file:///c:/Users/KIIT0001/logs.html) featuring real-time log querying, query filtering, collapsible JSON payload details, and secure administrator gates using Vercel Project Environment variables (`ADMIN_PASSWORD`).

### Phase D: Client Performance & Error Tracking (Fully Deployed)
*   **Combat FPS Telemetry:** Integrated real-time frame rate monitors inside the core rendering loop ([Game.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Game.js)). Samples active frames, filters startup peaks, and transmits the 5th-percentile minimum FPS and average FPS upon match conclusion to `/api/track?event=game_performance`.
*   **GPU Profiler:** Queries physical device GPU parameters using `WEBGL_debug_renderer_info` to identify player hardware constraints.
*   **Crash & Rejection Boundaries:** Registered global `window.onerror` and `window.onunhandledrejection` handlers in [index.html](file:///c:/Users/KIIT0001/Desktop/fun/index.html) to catalog unexpected JS exceptions.
*   **Asset Fetch Protectors:** Wrapped loader functions inside [Game.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Game.js) and [Character.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Character.js) with try/catch telemetry alerts to instantly report network failures.
*   **Skill Balancing Analytics:** Integrated per-match debounced skill usage counters (capped at 3 events per move) in [Character.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Character.js) to log and analyze combo popularity without overloading database pipelines.
*   **Premium Logs Visuals:** Integrated gorgeous indicators in [logs.html](file:///c:/Users/KIIT0001/Desktop/fun/logs.html) showing custom glowing red badges for client crashes, amber speedometer badges for game performance, and violet play buttons for general combat telemetry.

---

## 🛠️ 2. Diagnosed Engine Glitches (Backlog)

### 🐛 Issue A: Easy Mode AI "Friction Freeze" (Why the AI Stops Moving)
*   **Status:** Isolated & Documented.
*   **Target File:** `src/AIBot.js` ([AIBot.js](file:///c:/Users/KIIT0001/Desktop/fun/src/AIBot.js#L57-L79))
*   **The Glitch:** The AI bot clears its virtual controller keys via `_resetKeys()` at the start of its update loop. When an `actionCooldown` is active, it decrements the timer and performs an early `return`. On Easy difficulty, this cooldown is **1.0 second**. Because it returns early *after* resetting the keys, it releases all movement keys completely, and the high physics friction (`FRICTION = 50.0`) instantly drops its velocity to zero, causing the bot to freeze like a statue for 1 second after every move.
*   **Action Plan:** Refactor `src/AIBot.js`'s update sequence to keep spacing movement controls independent from combat combo/attack timers.

### 🐛 Issue B: Ryomen Raj's Transformation State Lock (Why the Player Gets Stuck)
*   **Status:** Isolated & Documented.
*   **Target Files:** `src/heroes/RyomenRaj.js` ([RyomenRaj.js](file:///c:/Users/KIIT0001/Desktop/fun/src/heroes/RyomenRaj.js)) and `src/Character.js` ([Character.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Character.js#L366-L377))
*   **The Glitch:** Player input and attacks are guarded by the combat state `isAttacking`. Normally, once an attack animation completes, the Three.js mixer triggers a `'finished'` event, resetting `isAttacking = false`. However, when Ryomen Raj transforms into his Domain Expansion, his active mixer is swapped from `this.basicMixer` to `this.domainMixer`. Because the core finish listener is only bound to the initial basic mixer during setup in [Character.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Character.js), domain animation completions fail to trigger the state reset, locking the player in `isAttacking = true` forever.
*   **Action Plan:** Bind explicit finish event listeners to both basic and domain mixers during instantiation, and implement safe state resets when swapping forms.

---

## 📡 3. Vercel Bandwidth & Asset Optimizations (Saved Backlog)

### 💾 Optimization 1: External CDN Media Hosting (Safe Bandwidth Bypass)
*   **Goal:** Prevent large cinematic background videos (`arena_2_video.mp4` is ~7.2MB) and theme soundtrack audio files from consuming Vercel's 100 GB Fast Data Transfer limit.
*   **Action Plan:** Upload heavy media files to a free, fast content delivery network (such as GitHub Git-LFS, Cloudinary, or an external CDN) and update absolute paths inside [Game.js](file:///c:/Users/KIIT0001/Desktop/fun/src/Game.js) and theme scripts.

### 💽 Optimization 2: Aggressive Service Worker Caching
*   **Goal:** Cache high-fidelity character `.glb` models, sound effects, and CSS files locally inside the user's browser storage, eliminating redundant server requests entirely.
*   **Action Plan:** Write a custom Service Worker (`sw.js`) utilizing the Cache Storage API to intercept and save asset queries, ensuring subsequent visits consume 0 bytes of network transfer.

---

## 🗺️ 4. Long-Term Development Roadmap

*   [ ] Refactor and stabilize **Easy Mode AI movement spacing** (Issue A).
*   [ ] Stabilize **Ryomen Raj's transformation animation mixer transitions** (Issue B).
*   [ ] Offload massive cinematic assets to CDNs and set up a Service Worker (Optimizations 1 & 2).
*   [ ] Implement **Multiplayer Online Combat** using WebSockets or Peer-to-Peer channels.
*   [ ] Integrate **Draco Compression** on GLB character meshes to shrink the asset footprint from 500MB down to ~80MB, ensuring instant mobile loading.

***

*Last Updated: May 18, 2026*
*Status: STABLE, TELEMETRY FULLY ACTIVE & INTEGRATED*

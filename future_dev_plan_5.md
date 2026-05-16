# Future Dev Plan 5: Interface Polish & Audio Implementation

## 1. Achievements (What We Just Fixed)
*   **Ryomen Raj Domain Expansion Fully Stabilized:**
    *   Diagnosed the root cause of the "sinking dwarf" bug: The engine was measuring the character's feet while the idle animation was still halfway through its fade-in blend, resulting in corrupted bone heights.
    *   Implemented `staticFootOffset: 'use_box'` in the core engine. This completely bypasses broken animation bones and locks the exact lowest geometric vertex of glitchy meshes to the ground plane (`y = -3.0`).
    *   Restored Ryomen Raj's Domain form to his correct, intended proportions (`manualScale: 240`) while mathematically guaranteeing he stands perfectly on top of the red blood pool.
*   **Browser Cache Busting:** Implemented a global versioning bump (`?v=49`) across the orchestration layer to prevent the browser from serving stale Javascript code.

## 2. Next Steps: Audio Engine & Theme Music
*   **Implement Global Audio Manager:** Create a robust audio management system to handle background music and sound effects.
*   **Dynamic Volume Control:**
    *   Load and play the main theme song.
    *   When the player is in the UI/Menu (interface), the theme should play at **normal/high volume**.
    *   When the player transitions into the Arena (combat starts), the theme should dynamically crossfade to a **lower background volume** so combat sound effects can be heard clearly.

## 3. Next Steps: Interface Polish
*   **UI Aesthetics:** Polish the health bars, character selection screens, and general interface to make the game feel premium and responsive.
*   **Combat Sound Effects:** Implement punch, kick, magic, and hit sound effects corresponding to character actions.
*   **Push Mechanics:** Revisit the collision physics to ensure characters correctly "push" each other during combat without clipping through enemy models.

## 4. Deployment Strategy & Optimization
*   **Free Hosting:** The game is deployable for free on platforms like **Vercel, Netlify, or GitHub Pages**. 
*   **Smooth Performance:** Because the 3D models and animations (`.glb` files) are quite large, the game might take a while to load on slower internet connections.
*   **Action Plan for Smooth Online Play:** Before deploying, we will compress the large `.glb` files using **Draco Compression** or **glTF-Transform**. This can shrink your 3D assets by up to 80% without losing visual quality, ensuring the game loads instantly and runs at a buttery smooth 60FPS on the web!

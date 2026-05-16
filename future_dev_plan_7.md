# Future Development Plan 7: Advanced Soundscapes, Arena Expansion & Multiplayer Prep

This plan outlines the next phase of evolution for the project, focusing on environmental immersion through sound, expanding the playable world, and laying the groundwork for online play.

## Phase 1: Environmental Sound Engineering
**Goal**: Create a living world where sound reacts to the arena.
- **Arena Ambient Loops**: Add unique background soundscapes for each arena (e.g., haunting wind for the current ruins, tech-hum for a lab).
- **Spatial Audio & Reverb**: Implement an `AudioNode` chain that adds environmental reverb.
  - *Ancient Arena*: High decay, spacious reverb.
  - *Future Arena*: Short, metallic echoes.
- **Dynamic Combat SFX**: Scale the volume and pitch of "hit" sounds based on the damage dealt or the speed of the impact.

## Phase 2: Arena Expansion ("The Neon Dojo")
**Goal**: Introduce a second high-fidelity combat environment.
- **New Asset Integration**: Add a high-resolution video/image background for a "Neon Dojo" or "Cyberpunk Street".
- **Arena Selection UI**: Add a selector in the pre-match screen to choose the battlefield.
- **Environmental Particles**: Add unique particles for the new arena (e.g., falling cherry blossoms or digital rain).

## Phase 3: Visual Combat Polish
**Goal**: Make the hits feel impactful and "weighty".
- **Dynamic Camera Shakes**: Implement camera trauma/shake on "Heavy" or "Magic" attacks.
- **Hit Sparks & Effects**: Upgrade the current particle system to include directional hit sparks that fly away from the point of impact.
- **Bloom & Post-Processing**: Add a subtle Bloom pass to make "Dark Energy" and "Magic" attacks glow realistically.

## Phase 4: Online Multiplayer Foundation
**Goal**: Prepare the engine for sharing with friends.
- **State Serialization**: Refactor the `Character` and `InputManager` to support serializing game state into small JSON packets.
- **Networking Protocol**: 
  - **Option A (WebRTC)**: Peer-to-peer for low latency (ideal for 1v1).
  - **Option B (Socket.io)**: Server-based for easier lobby management.
- **Lobby System**: A simple UI to "Create Room" which generates a URL you can send to a friend to join the match.

## Verification Plan
### Manual Testing
- Verify that sound reverb changes when switching between different arenas.
- Ensure the "Neon Dojo" correctly handles parallax scrolling.
- Test the camera shake intensity to ensure it doesn't cause motion sickness.

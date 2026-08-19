# Research & Technical Decisions: Ludo Game with Multiplayer & Computer AI

**Feature**: `001-ludo-multiplayer-ai` | **Date**: 2026-08-17

This document outlines the technical research, architecture evaluations, and decisions for building a high-performance, responsive Ludo game supporting solo play vs. computer AI, local pass & play, and online multiplayer with AI backfill.

---

## 1. Core Architecture & Game Engine

### Decision
Implement a pure, decoupled, deterministic TypeScript **`LudoEngine`** state machine that manages board topology, rules validation, dice rolling, token movements, captures, safe zones, extra turns, and win detection completely independent of the UI layer.

### Rationale
- Decoupling the game logic from the DOM/render layer ensures:
  - 100% deterministic testability of all Ludo rule corner cases (3 sixes rule, exact home roll, safe star squares, capture chains).
  - Instantaneous AI bot evaluations (the AI can clone and simulate engine states in microseconds).
  - Zero-latency state serialization for local persistence and multiplayer synchronization.
- Allows pluggable renderers (SVG + Canvas + DOM) without changing game rules.

### Alternatives Considered
- *Coupled React Component State*: Leads to synchronization bugs, laggy AI loops, and difficulty serializing state across network drops.
- *Physics-engine Driven Board*: Overkill and non-deterministic for board game square calculations.

---

## 2. Board Topology & Track Coordinate Mapping

### Decision
Standardize a universal **57-step coordinate coordinate mapping** per player:
- **Global Track**: 52 common outer tiles indexed `0` to `51`.
  - Player Start Tiles: Red at `0`, Green at `13`, Yellow at `26`, Blue at `39`.
  - Safe Squares: 8 total — `0, 8, 13, 21, 26, 34, 39, 47`.
- **Home Paths**: 5 private colored tiles per player (`steps 51 to 55`).
- **Center Home**: Step `56` (exact roll required).
- **Yard/Base**: Step `-1` (requires rolling a 6 to transition to step `0`).

```text
Track Step Progress (0 -> 56):
[-1: Yard/Base] --(Roll 6)--> [0: Start Square] 
      --> [1..50: Outer Track Loop] 
      --> [51..55: Colored Home Path] 
      --> [56: Center Triangle Victory]
```

### Rationale
- Storing distance as `stepCount (0..56)` simplifies rule evaluation: any move `stepCount + roll > 56` is automatically illegal.
- Calculating collisions only requires converting `stepCount` into the `globalTrackIndex = (startOffset + stepCount) % 52` for non-home squares.

---

## 3. Computer AI Intelligence & Heuristic Decision Model

### Decision
Implement a multi-tier heuristic evaluation algorithm (**`LudoAI`**) capable of operating at three selectable difficulty levels:
1. **Casual**: Random legal move with basic token deployment on 6.
2. **Balanced**: Prioritizes token release > captures > reaching safe zones > moving nearest piece.
3. **Strategic (Smart AI)**: Uses a weighted utility scoring matrix:
   - Capture enemy token: `+100 pts`
   - Move into home triangle / complete token: `+80 pts`
   - Enter safe star square or colored home path: `+60 pts`
   - Escape vulnerable tile (enemy within 6 steps behind): `+50 pts`
   - Release token from base on 6: `+40 pts`
   - Advance leading token: `+20 pts`
   - Avoid creating vulnerability (moving within 6 steps ahead of enemy): `-30 pts`

### Rationale
- Instant execution time (<1ms computation time), allowing intentional 0.6s–0.8s human-like animation pauses before moving.
- Does not require heavy tree search / Minimax while providing a challenging and lifelike opponent.

---

## 4. Real-time Multiplayer & Bot Proxy Architecture

### Decision
Use a lightweight peer-to-peer (WebRTC / PeerJS) and local room coordinator with automated heartbeat timeout monitors.
- **Bot Backfill Trigger**: If a player slot is empty at game start OR a connected player fails to send a heartbeat within 15 seconds, the local host machine transparently assigns `LudoAI` to execute turns for that slot.
- **State Reconciliation**: Host authoritative state broadcasts ensure all clients render identical dice rolls and token movements.

### Rationale
- Ensures multiplayer games never stall if someone leaves or has network issues.
- Zero server hosting costs for peer-to-peer / local play with fallback AI bots.

---

## 5. UI/UX & Taste-Skill Frontend Specification

### Decision
Apply the **Taste-Skill** directives:
- **Design Read**: Modern tactical dark-mode board game aesthetic (`DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 8`, `VISUAL_DENSITY: 5`).
- **Board Rendering**: Pure SVG + CSS Grid layout scaling seamlessly inside `min-h-[100dvh]` with zero viewport scrolling.
- **3D Dice Physics**: CSS 3D transformed cube with dynamic rotational tumble, shadow blur, and haptic feedback.
- **Procedural Audio (Web Audio API)**:
  - Custom synthesized dice shaker, click clack token hop, enemy capture thud, and victory fanfare.
  - Zero external `.mp3` loading dependencies; works 100% offline.
- **Path Glows & Move Previews**: When a die is rolled, valid tokens pulse and hovering/focusing projects glowing target squares in the player's vibrant theme color.

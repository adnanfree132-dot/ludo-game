# Implementation Plan: Ludo Game with Multiplayer & Computer AI

**Branch**: `001-ludo-multiplayer-ai` | **Date**: 2026-08-17 | **Spec**: [specs/001-ludo-multiplayer-ai/spec.md](spec.md)

**Input**: Feature specification from `specs/001-ludo-multiplayer-ai/spec.md`

## Summary

Build a high-performance, visually stunning Ludo board game featuring:
1. **Solo Play vs Computer AI**: 1 to 3 AI bots with heuristic decision modeling (capturing, safe zones, token deployment).
2. **Pass & Play Local Multiplayer**: 2 to 4 players on a single device with responsive turn rotations and legal move highlighting.
3. **Online Room Multiplayer with Bot Backfill**: Peer-to-peer room hosting with automatic AI proxy takeover if players disconnect or slots remain open.
4. **Taste-Skill Design System**: Modern tactile board aesthetics (`DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 8`, `VISUAL_DENSITY: 5`), 3D dice rolling physics, procedural Web Audio SFX, and WCAG AA contrast.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Modern ES6+ JavaScript  
**Primary Dependencies**: Vanilla CSS (Tailwind utilities), Canvas/SVG for high-DPI board geometry, Web Audio API for zero-dependency procedural SFX, PeerJS/WebRTC for peer rooms.  
**Storage**: Browser LocalStorage for match state persistence and audio/theme preferences.  
**Testing**: Unit testing for engine rules, AI heuristics, and coordinate mapping via Vitest / Jest.  
**Target Platform**: All modern evergreen desktop and mobile web browsers (Chrome, Safari, Firefox, Edge, iOS Safari, Android Chrome).  
**Project Type**: Single-page web application / interactive board game engine.  
**Performance Goals**: 60 FPS continuous animation rendering, <1ms AI computation time, <50ms audio latency, zero layout shifts (`0px` CLS).  
**Constraints**: Fully offline-capable for Solo vs AI and Pass & Play; `min-h-[100dvh]` viewport locking without vertical page bounce.  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement | Plan Alignment & Status |
| :--- | :--- | :--- |
| **I. Taste-Skill Driven UI & UX** | Mandatory design read, explicit dials (`7/8/5`), anti-slop typography, single-accent calibration, 3D dice. | ✅ **PASS** — Documented in `research.md` with 3D CSS dice tumbler, glowing landing markers, and vector SVG board geometry. |
| **II. Visual Asset & Materiality Integrity** | Real visuals over fake div mockups; authentic vector icons and tokens. | ✅ **PASS** — Crisp vector board tiles, tactile haptic tokens with drop shadows, and SVG icons. |
| **III. Modern Architecture & Component Discipline** | Decoupled state engine, accessibility (WCAG AA), responsive viewport scaling (`100dvh`). | ✅ **PASS** — Headless `LudoEngine` decoupled from `BoardRenderer`; contrast-calibrated palette. |
| **IV. Hardware-Accelerated Performance & Motion** | `transform` and `opacity` only, motivated motion, `prefers-reduced-motion` support. | ✅ **PASS** — GPU-accelerated CSS 3D dice rotation and smooth token step interpolation. |
| **V. Spec-Driven Development (SDD) Rigor** | Specs, plans, contracts, and verification guides completed before implementation. | ✅ **PASS** — Complete Phase 0 (`research.md`) and Phase 1 (`data-model.md`, `contracts/`, `quickstart.md`) delivered. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-ludo-multiplayer-ai/
├── spec.md              # Feature specification
├── plan.md              # This technical implementation plan
├── research.md          # Technical research & architecture decisions
├── data-model.md        # Data models, entities & state transitions
├── quickstart.md        # Verification and testing scenarios
├── contracts/           # API and protocol contracts
│   ├── engine-api.md    # LudoEngine API interface
│   ├── ai-agent-api.md  # LudoAI decision agent interface
│   └── room-protocol.md # Realtime sync & bot takeover protocol
└── checklists/
    └── requirements.md  # Specification validation checklist
```

### Source Code Layout

```text
src/
├── engine/
│   ├── Types.ts             # Domain types (Player, Token, GameState, MoveRecord)
│   ├── BoardTopology.ts     # 52 track squares, safe zones, home paths coordinate math
│   ├── LudoRules.ts         # Legality checks, capture logic, 3-sixes forfeiture
│   └── LudoEngine.ts        # Pure headless state machine & subscription dispatcher
├── ai/
│   ├── Heuristics.ts        # Move scoring weights (captures, safety, progress, escape)
│   └── LudoAI.ts            # Bot decision-making & thinking delay simulator
├── audio/
│   └── SoundManager.ts      # Web Audio API procedural sound synthesizer (dice, click, fanfare)
├── network/
│   ├── Protocol.ts          # Room messages & packet schemas
│   └── RoomManager.ts       # Peer synchronization, heartbeat monitor & AI bot proxy takeover
├── ui/
│   ├── BoardRenderer.ts     # High-DPI SVG/Canvas board layout with glowing path highlights
│   ├── DiceRenderer.ts      # 3D CSS tumbling dice with physics & roll buttons
│   ├── TurnIndicator.ts     # Active player tray, color themes, avatar pulse
│   ├── LobbyModal.ts        # Mode selection, player counts, AI difficulty sliders
│   └── VictoryModal.ts      # 1st/2nd/3rd podium rankings, stats, & rematch triggers
├── styles/
│   └── index.css            # Taste-Skill CSS tokens, board styling, 3D dice transforms
└── main.ts                  # Application bootstrap & coordinator
```

---

## Complexity Tracking

*No constitution violations or unwarranted complexity introduced. All components are strictly modular, decoupled, and testable.*

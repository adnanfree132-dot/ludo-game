# Quickstart & Validation Guide: Ludo Game

**Feature**: `001-ludo-multiplayer-ai` | **Date**: 2026-08-17

This guide provides step-by-step instructions for launching and validating the Ludo game across all game modes, rules, and AI behaviors.

---

## 1. Launching the Application Locally

```bash
# Start local development server
npm run dev
# or open index.html directly in modern Chromium/Firefox/Safari browser
```

---

## 2. End-to-End Verification Scenarios

### Scenario A: Solo Play vs 3 Computer AI Bots
1. Open the game in your browser.
2. On the mode selector, click **"Play vs Computer"**.
3. Select **4 Players** and choose your preferred color (e.g. Red).
4. Set AI difficulty to **"Strategic"** and click **"Start Match"**.
5. **Expected Outcome**:
   - The board renders in the active theme with Red, Green, Yellow, and Blue bases.
   - Click the 3D dice to roll. If a 6 is rolled, click your token in the base to deploy to start.
   - When turn ends, AI bots (Green, Yellow, Blue) automatically roll and move with smooth 0.6s–0.8s pacing.
   - Captures award extra rolls and send enemy tokens back to base.

### Scenario B: Pass & Play Local Multiplayer
1. Click **"New Game"** → **"Pass & Play"**.
2. Select **3 Players** (Red, Green, Yellow).
3. **Expected Outcome**:
   - Turn indicator highlights active player with matching theme glow.
   - Multi-token selection correctly highlights all eligible pieces.
   - Rolling 3 consecutive sixes forfeits the turn and rotates clockwise.
   - Reaching center home triangle with all 4 tokens displays the victory screen and podium rankings.

### Scenario C: Online Room with AI Bot Backfill
1. Click **"Online Multiplayer"** → **"Create Room"**.
2. Copy the generated 6-character room code.
3. In a second browser window/tab, click **"Join Room"** and enter the code.
4. With 2 human players joined, click **"Start Game with Bot Fill"**.
5. **Expected Outcome**:
   - The remaining 2 unfilled seats are immediately populated with AI bots.
   - Closing the second browser window triggers the 15-second heartbeat guard, seamlessly converting the disconnected player into an AI bot without stalling the host's match.

### Scenario D: Taste-Skill Design & Responsive Polish
1. Open browser Developer Tools and toggle Device Mode (iPhone SE 375px → iPad Pro 1024px → 4K Desktop).
2. **Expected Outcome**:
   - Board and dice tray scale dynamically within `min-h-[100dvh]` without layout breakage or horizontal scrollbars.
   - Procedural Web Audio produces clean dice roll and token clack sounds.
   - Mute button in the top navigation toggles sound state instantly.

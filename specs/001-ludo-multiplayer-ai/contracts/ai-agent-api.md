# Contract: LudoAI Decision Agent Interface

**Feature**: `001-ludo-multiplayer-ai` | **Date**: 2026-08-17

This contract defines the interface and evaluation protocol for computer-controlled Ludo AI bots.

---

## 1. AI Agent Interface

```typescript
export interface ILudoAI {
  /**
   * Computes and selects the optimal token ID to move from a list of eligible moves.
   *
   * @param state Current read-only game state snapshot
   * @param playerIndex Index of the AI player whose turn it is
   * @param eligibleTokenIds Array of legal token IDs to choose from
   * @param difficulty Strategy level ('casual' | 'balanced' | 'strategic')
   * @returns The chosen token ID
   */
  decideMove(
    state: Readonly<GameState>,
    playerIndex: number,
    eligibleTokenIds: string[],
    difficulty: AIDifficulty
  ): string;

  /**
   * Returns simulated delay in milliseconds before the AI rolls or moves
   * to ensure gameplay feels natural and human-paced.
   */
  getThinkingDelay(action: 'roll' | 'move', difficulty: AIDifficulty): number;
}
```

---

## 2. Evaluation Heuristic Score Model

```typescript
export interface MoveEvaluation {
  tokenId: string;
  score: number;
  factors: {
    canCaptureEnemy: boolean;      // +100 pts
    canEnterHomeTriangle: boolean;  // +80 pts
    canEnterSafeZone: boolean;      // +60 pts
    isEscapingDanger: boolean;      // +50 pts
    isDeployingFromBase: boolean;   // +40 pts
    progressDistance: number;       // +1 pt per step
    willBecomeVulnerable: boolean;  // -30 pts
  };
}
```

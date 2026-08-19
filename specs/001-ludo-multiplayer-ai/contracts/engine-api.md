# Contract: LudoEngine API Interface

**Feature**: `001-ludo-multiplayer-ai` | **Date**: 2026-08-17

This contract specifies the public programmatic interface for the headless `LudoEngine` state machine.

---

## 1. Core Engine Methods

```typescript
export interface ILudoEngine {
  /**
   * Initializes a new match with specified configuration.
   */
  startMatch(config: MatchConfig): GameState;

  /**
   * Triggers a dice roll for the active player.
   * Calculates random value (1-6), evaluates eligible tokens, and handles 3-sixes forfeiture.
   */
  rollDice(forcedValue?: number): DiceRollResult;

  /**
   * Moves a specific token based on the current dice roll value.
   * Handles path traversal, capture checks, home finishes, and extra turn triggers.
   */
  moveToken(tokenId: string): MoveResult;

  /**
   * Returns list of token IDs that can legally move given the current dice roll.
   */
  getEligibleMoves(): string[];

  /**
   * Retrieves current immutable snapshot of the game state.
   */
  getState(): Readonly<GameState>;

  /**
   * Registers a listener callback invoked whenever game state changes.
   */
  subscribe(listener: (state: Readonly<GameState>) => void): () => void;
}
```

---

## 2. Parameter & Result Contracts

### `MatchConfig`
```typescript
export interface MatchConfig {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  slots: {
    color: PlayerColor;
    name: string;
    type: SlotType;
    difficulty?: AIDifficulty;
  }[];
}
```

### `DiceRollResult`
```typescript
export interface DiceRollResult {
  value: number;
  consecutiveSixes: number;
  eligibleTokenIds: string[];
  isTurnForfeited: boolean;     // True if 3 consecutive sixes occurred
  autoAdvance: boolean;         // True if 0 valid moves are available
  nextPlayerIndex?: number;     // Defined if auto-advanced
}
```

### `MoveResult`
```typescript
export interface MoveResult {
  success: boolean;
  movedToken: Token;
  capturedToken: Token | null;
  enteredHome: boolean;
  earnedExtraRoll: boolean;
  isGameOver: boolean;
  rankings: number[];
  nextPlayerIndex: number;
}
```

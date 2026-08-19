import { GameState, AIDifficulty } from '../engine/Types';
import { scoreTokenMove } from './Heuristics';

export class LudoAI {
  /**
   * Selects the optimal token ID to move from a list of eligible moves.
   */
  public decideMove(
    state: Readonly<GameState>,
    playerIndex: number,
    eligibleTokenIds: string[],
    difficulty: AIDifficulty = 'strategic'
  ): string {
    if (eligibleTokenIds.length === 0) return '';
    if (eligibleTokenIds.length === 1) return eligibleTokenIds[0];

    const player = state.players[playerIndex];
    let bestTokenId = eligibleTokenIds[0];
    let highestScore = -Infinity;

    for (const tokenId of eligibleTokenIds) {
      const token = player.tokens.find((t) => t.id === tokenId);
      if (!token) continue;

      const score = scoreTokenMove(token, state as GameState, state.dice.currentValue, difficulty);
      if (score > highestScore) {
        highestScore = score;
        bestTokenId = tokenId;
      }
    }

    return bestTokenId;
  }

  /**
   * Returns human-like thinking delay in milliseconds for AI actions.
   */
  public getThinkingDelay(action: 'roll' | 'move', difficulty: AIDifficulty = 'strategic'): number {
    if (action === 'roll') {
      return difficulty === 'casual' ? 450 + Math.random() * 250 : 600 + Math.random() * 300;
    } else {
      return difficulty === 'casual' ? 400 + Math.random() * 200 : 500 + Math.random() * 350;
    }
  }
}

import { GameState, Token, AIDifficulty } from '../engine/Types';
import {
  TOTAL_STEPS_TO_HOME,
  isSafePosition,
  getGlobalPosition,
} from '../engine/BoardTopology';
import { calculateTargetStep, findCapturableToken } from '../engine/LudoRules';

export interface EvaluatedMove {
  tokenId: string;
  score: number;
}

/**
 * Evaluates and scores an eligible token move for an AI player based on strategic utility.
 */
export function scoreTokenMove(
  token: Token,
  state: GameState,
  diceValue: number,
  difficulty: AIDifficulty
): number {
  if (difficulty === 'casual') {
    // Casual AI: Deploy on 6, otherwise random priority
    if (token.state === 'base' && diceValue === 6) return 50 + Math.random() * 20;
    return Math.random() * 50;
  }

  const activePlayer = state.players[state.activePlayerIndex];
  const targetStep = calculateTargetStep(token, diceValue);
  const targetGlobalPos =
    targetStep <= 50 ? getGlobalPosition(token.color, targetStep) : null;

  let score = 10; // Baseline legal move value

  // 1. Capture enemy token: Highest utility priority
  const capturableToken = findCapturableToken(
    targetGlobalPos,
    activePlayer.index,
    state.players
  );
  if (capturableToken) {
    score += 120;
  }

  // 2. Reaching center home triangle (victory piece)
  if (targetStep === TOTAL_STEPS_TO_HOME) {
    score += 95;
  }

  // 3. Entering home path (permanent safety)
  if (token.stepCount <= 50 && targetStep > 50) {
    score += 75;
  }

  // 4. Landing on a safe star square
  if (targetGlobalPos !== null && isSafePosition(targetGlobalPos)) {
    score += 65;
  }

  // 5. Deploying a token from base yard onto start square
  if (token.state === 'base' && diceValue === 6) {
    const enemyNearStart = state.players.some((p) =>
      p.index !== activePlayer.index &&
      p.tokens.some(
        (t) =>
          t.state === 'track' &&
          t.globalPos !== null &&
          targetGlobalPos !== null &&
          (targetGlobalPos - t.globalPos + 52) % 52 <= 4
      )
    );

    // Extra priority if we have multiple tokens locked in base
    const baseCount = activePlayer.tokensInBase;
    score += 55 + baseCount * 8 + (enemyNearStart ? 20 : 0);
  }

  // 6. Escaping vulnerability (opponent within 1-6 steps behind current position)
  if (token.state === 'track' && token.globalPos !== null && !isSafePosition(token.globalPos)) {
    const isThreatened = state.players.some((p) =>
      p.index !== activePlayer.index &&
      p.tokens.some((t) => {
        if (t.state !== 'track' || t.globalPos === null) return false;
        const distance = (token.globalPos! - t.globalPos + 52) % 52;
        return distance >= 1 && distance <= 6;
      })
    );

    if (isThreatened) {
      score += 50;
    }
  }

  // 7. General forward track progression
  score += targetStep * 0.8;

  // 8. In Balanced vs Strategic mode: Penalize moving into danger
  if (difficulty === 'strategic' && targetGlobalPos !== null && !isSafePosition(targetGlobalPos)) {
    const willBeThreatened = state.players.some((p) =>
      p.index !== activePlayer.index &&
      p.tokens.some((t) => {
        if (t.state !== 'track' || t.globalPos === null) return false;
        const distance = (targetGlobalPos - t.globalPos + 52) % 52;
        return distance >= 1 && distance <= 6;
      })
    );

    if (willBeThreatened) {
      score -= 25;
    }
  }

  // Small random jitter to make equal moves feel varied
  score += Math.random() * 4;

  return score;
}

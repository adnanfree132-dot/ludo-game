import { Token, Player } from './Types';
import { TOTAL_STEPS_TO_HOME, isSafePosition } from './BoardTopology';

/**
 * Checks if a token can legally move given the rolled dice value.
 */
export function canTokenMove(token: Token, diceValue: number): boolean {
  // Already finished in home
  if (token.state === 'finished' || token.stepCount >= TOTAL_STEPS_TO_HOME) {
    return false;
  }

  // In base: Can only deploy if rolling a 6
  if (token.state === 'base' || token.stepCount === -1) {
    return diceValue === 6;
  }

  // On outer track or home path: Can move if target step does not overshoot 56
  const targetStep = token.stepCount + diceValue;
  return targetStep <= TOTAL_STEPS_TO_HOME;
}

/**
 * Calculates the destination step for a token given a dice roll value.
 */
export function calculateTargetStep(token: Token, diceValue: number): number {
  if (token.state === 'base' || token.stepCount === -1) {
    return 0; // Deploys to start square
  }
  return token.stepCount + diceValue;
}

/**
 * Checks if a destination global position collides with an opponent's token on a non-safe square.
 * Returns the opponent Token that would be captured, or null if no capture occurs.
 */
export function findCapturableToken(
  targetGlobalPos: number | null,
  activePlayerIndex: number,
  players: Player[]
): Token | null {
  if (targetGlobalPos === null) return null;
  if (isSafePosition(targetGlobalPos)) return null;

  for (const player of players) {
    if (player.index === activePlayerIndex) continue; // Friendly tokens are safe

    for (const token of player.tokens) {
      if (token.state === 'track' && token.globalPos === targetGlobalPos) {
        return token;
      }
    }
  }

  return null;
}

/**
 * Returns all token IDs owned by the player that can legally move with the current dice value.
 */
export function getEligibleTokens(player: Player, diceValue: number): string[] {
  const eligibleIds: string[] = [];
  for (const token of player.tokens) {
    if (canTokenMove(token, diceValue)) {
      eligibleIds.push(token.id);
    }
  }
  return eligibleIds;
}

/**
 * Evaluates whether all but 1 active player have finished all their tokens.
 */
export function checkIsGameOver(players: Player[]): boolean {
  const activeCount = players.length;
  if (activeCount <= 1) return true;

  const finishedCount = players.filter((p) => p.hasWon).length;
  return finishedCount >= activeCount - 1;
}

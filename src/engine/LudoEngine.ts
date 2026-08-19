import {
  GameState,
  MatchConfig,
  Player,
  Token,
  DiceRollResult,
  MoveResult,
  MoveRecord,
} from './Types';
import {
  COLOR_ORDER,
  TOTAL_STEPS_TO_HOME,
  getGlobalPosition,
} from './BoardTopology';
import {
  canTokenMove,
  calculateTargetStep,
  findCapturableToken,
  getEligibleTokens,
  checkIsGameOver,
} from './LudoRules';

const STORAGE_KEY = 'ludo_game_state_v1';

export class LudoEngine {
  private state: GameState;
  private listeners: Set<(state: Readonly<GameState>) => void> = new Set();

  constructor() {
    this.state = this.createDefaultState();
  }

  /**
   * Initializes and starts a new game session.
   */
  public startMatch(config: MatchConfig): GameState {
    const players: Player[] = config.slots.map((slot, index) => {
      const tokens: Token[] = [0, 1, 2, 3].map((tokenIdx) => ({
        id: `${slot.color}-${tokenIdx}`,
        playerIndex: index,
        color: slot.color,
        tokenIndex: tokenIdx,
        state: 'base',
        stepCount: -1,
        globalPos: null,
        isEligible: false,
      }));

      return {
        index,
        name: slot.name || `Player ${index + 1}`,
        color: slot.color,
        slotType: slot.type,
        difficulty: slot.difficulty || 'balanced',
        tokens,
        tokensInBase: 4,
        tokensFinished: 0,
        hasWon: false,
        finishRank: null,
        avatarId: `avatar-${slot.color}`,
        isActive: index === 0,
      };
    });

    this.state = {
      id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mode: config.mode,
      phase: 'waiting_roll',
      activePlayerIndex: 0,
      players,
      dice: {
        currentValue: 1,
        isRolling: false,
        consecutiveSixes: 0,
        eligibleTokenIds: [],
        lastRolledTimestamp: Date.now(),
      },
      turnCount: 1,
      winnerList: [],
      history: [],
      lastMove: null,
      soundEnabled: true,
      hapticsEnabled: true,
      theme: config.theme || 'obsidian',
    };

    this.persistState();
    this.notify();
    return this.getState();
  }

  /**
   * Rolls the dice for the active player.
   */
  public rollDice(forcedValue?: number): DiceRollResult {
    if (this.state.phase !== 'waiting_roll' || this.state.dice.isRolling) {
      return {
        value: this.state.dice.currentValue,
        consecutiveSixes: this.state.dice.consecutiveSixes,
        eligibleTokenIds: this.state.dice.eligibleTokenIds,
        isTurnForfeited: false,
        autoAdvance: false,
      };
    }

    const rolledValue = forcedValue !== undefined ? forcedValue : Math.floor(Math.random() * 6) + 1;
    const consecutiveSixes = rolledValue === 6 ? this.state.dice.consecutiveSixes + 1 : 0;
    const activePlayer = this.state.players[this.state.activePlayerIndex];

    // Three consecutive sixes rule: Turn forfeited immediately
    if (consecutiveSixes >= 3) {
      this.state.dice = {
        currentValue: rolledValue,
        isRolling: false,
        consecutiveSixes: 0,
        eligibleTokenIds: [],
        lastRolledTimestamp: Date.now(),
      };
      this.state.phase = 'turn_resolved';
      this.advanceTurn();
      this.notify();

      return {
        value: rolledValue,
        consecutiveSixes: 3,
        eligibleTokenIds: [],
        isTurnForfeited: true,
        autoAdvance: true,
        nextPlayerIndex: this.state.activePlayerIndex,
      };
    }

    const eligibleTokenIds = getEligibleTokens(activePlayer, rolledValue);

    // Update tokens eligibility flags
    for (const token of activePlayer.tokens) {
      token.isEligible = eligibleTokenIds.includes(token.id);
    }

    this.state.dice = {
      currentValue: rolledValue,
      isRolling: false,
      consecutiveSixes,
      eligibleTokenIds,
      lastRolledTimestamp: Date.now(),
    };

    if (eligibleTokenIds.length === 0) {
      this.state.phase = 'turn_resolved';
      this.notify();
      return {
        value: rolledValue,
        consecutiveSixes,
        eligibleTokenIds: [],
        isTurnForfeited: false,
        autoAdvance: true,
      };
    }

    this.state.phase = 'selecting_move';
    this.notify();

    return {
      value: rolledValue,
      consecutiveSixes,
      eligibleTokenIds,
      isTurnForfeited: false,
      autoAdvance: false,
    };
  }

  /**
   * Executes a move with the specified token.
   */
  public moveToken(tokenId: string): MoveResult {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    const token = activePlayer.tokens.find((t) => t.id === tokenId);

    if (!token || !canTokenMove(token, this.state.dice.currentValue)) {
      return {
        success: false,
        movedToken: token || activePlayer.tokens[0],
        capturedToken: null,
        enteredHome: false,
        earnedExtraRoll: false,
        isGameOver: false,
        rankings: this.state.winnerList,
        nextPlayerIndex: this.state.activePlayerIndex,
      };
    }

    this.state.phase = 'moving';
    const fromStep = token.stepCount;
    const fromGlobalPos = token.globalPos;
    const targetStep = calculateTargetStep(token, this.state.dice.currentValue);

    // Update token step
    token.stepCount = targetStep;

    if (targetStep === 0) {
      token.state = 'track';
      token.globalPos = getGlobalPosition(token.color, 0);
    } else if (targetStep < TOTAL_STEPS_TO_HOME - 5) {
      token.state = 'track';
      token.globalPos = getGlobalPosition(token.color, targetStep);
    } else if (targetStep < TOTAL_STEPS_TO_HOME) {
      token.state = 'home_path';
      token.globalPos = null;
    } else {
      token.state = 'finished';
      token.globalPos = null;
    }

    // Recalculate player token counts
    activePlayer.tokensInBase = activePlayer.tokens.filter((t) => t.state === 'base').length;
    activePlayer.tokensFinished = activePlayer.tokens.filter((t) => t.state === 'finished').length;

    // Check for captures
    const capturedToken = findCapturableToken(
      token.globalPos,
      activePlayer.index,
      this.state.players
    );

    if (capturedToken) {
      capturedToken.state = 'base';
      capturedToken.stepCount = -1;
      capturedToken.globalPos = null;

      const capturedOwner = this.state.players[capturedToken.playerIndex];
      capturedOwner.tokensInBase = capturedOwner.tokens.filter((t) => t.state === 'base').length;
    }

    const enteredHome = token.state === 'finished' && fromStep !== TOTAL_STEPS_TO_HOME;
    if (activePlayer.tokensFinished === 4 && !activePlayer.hasWon) {
      activePlayer.hasWon = true;
      this.state.winnerList.push(activePlayer.index);
      activePlayer.finishRank = this.state.winnerList.length;
    }

    // Determine extra roll reward
    let earnedExtraRoll = false;
    let extraRollReason: 'rolled_six' | 'captured_opponent' | 'entered_home' | null = null;

    if (this.state.dice.currentValue === 6) {
      earnedExtraRoll = true;
      extraRollReason = 'rolled_six';
    } else if (capturedToken) {
      earnedExtraRoll = true;
      extraRollReason = 'captured_opponent';
    } else if (enteredHome) {
      earnedExtraRoll = true;
      extraRollReason = 'entered_home';
    }

    const moveRecord: MoveRecord = {
      turnIndex: this.state.turnCount,
      playerId: activePlayer.name,
      tokenId: token.id,
      diceValue: this.state.dice.currentValue,
      fromStep,
      toStep: targetStep,
      fromGlobalPos,
      toGlobalPos: token.globalPos,
      capturedTokenId: capturedToken ? capturedToken.id : null,
      earnedExtraRoll,
      extraRollReason,
      timestamp: Date.now(),
    };

    this.state.history.push(moveRecord);
    this.state.lastMove = moveRecord;

    // Clear token eligibility
    for (const p of this.state.players) {
      for (const t of p.tokens) {
        t.isEligible = false;
      }
    }

    const isGameOver = checkIsGameOver(this.state.players);
    if (isGameOver) {
      this.state.phase = 'game_over';
    } else if (earnedExtraRoll) {
      this.state.phase = 'waiting_roll';
    } else {
      this.state.phase = 'turn_resolved';
      this.advanceTurn();
    }

    this.persistState();
    this.notify();

    return {
      success: true,
      movedToken: token,
      capturedToken,
      enteredHome,
      earnedExtraRoll,
      isGameOver,
      rankings: this.state.winnerList,
      nextPlayerIndex: this.state.activePlayerIndex,
    };
  }

  /**
   * Advances the turn clockwise to the next active player who has not finished yet.
   */
  public advanceTurn(): void {
    const playerCount = this.state.players.length;
    let nextIndex = (this.state.activePlayerIndex + 1) % playerCount;

    // Skip players who have finished all their tokens
    let attempts = 0;
    while (this.state.players[nextIndex].hasWon && attempts < playerCount) {
      nextIndex = (nextIndex + 1) % playerCount;
      attempts++;
    }

    for (const player of this.state.players) {
      player.isActive = player.index === nextIndex;
    }

    this.state.activePlayerIndex = nextIndex;
    this.state.phase = 'waiting_roll';
    this.state.turnCount++;
    this.state.dice = {
      currentValue: this.state.dice.currentValue,
      isRolling: false,
      consecutiveSixes: 0,
      eligibleTokenIds: [],
      lastRolledTimestamp: Date.now(),
    };

    this.persistState();
    this.notify();
  }

  /**
   * Returns list of legal token IDs for active player with current dice value.
   */
  public getEligibleMoves(): string[] {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    if (!activePlayer) return [];
    return getEligibleTokens(activePlayer, this.state.dice.currentValue);
  }

  public getState(): Readonly<GameState> {
    return this.state;
  }

  public subscribe(listener: (state: Readonly<GameState>) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public setSoundEnabled(enabled: boolean): void {
    this.state.soundEnabled = enabled;
    this.persistState();
    this.notify();
  }

  public setHapticsEnabled(enabled: boolean): void {
    this.state.hapticsEnabled = enabled;
    this.persistState();
    this.notify();
  }

  public setTheme(theme: import('./Types').BoardTheme): void {
    this.state.theme = theme;
    this.persistState();
    this.notify();
  }

  public setFullState(state: GameState): void {
    this.state = state;
    this.persistState();
    this.notify();
  }

  private notify(): void {
    const currentState = this.getState();
    for (const listener of this.listeners) {
      listener(currentState);
    }
  }

  private persistState(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignore storage write errors in private mode
    }
  }

  public restoreSavedState(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.players && parsed.players.length > 0) {
            this.state = parsed;
            this.notify();
            return true;
          }
        }
      }
    } catch {
      // Fall through to default
    }
    return false;
  }

  private createDefaultState(): GameState {
    const defaultSlots = COLOR_ORDER.map((color, idx) => ({
      color,
      name: idx === 0 ? 'You' : `Bot ${idx}`,
      type: idx === 0 ? ('local_human' as const) : ('ai_bot' as const),
      difficulty: 'strategic' as const,
    }));

    return this.startMatch({
      mode: 'vs_ai',
      playerCount: 4,
      slots: defaultSlots,
    });
  }
}

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type SlotType = 'local_human' | 'ai_bot' | 'remote_player';

export type AIDifficulty = 'casual' | 'balanced' | 'strategic';

export type BoardTheme = 'obsidian' | 'cyberpunk' | 'royal_glass' | 'classic_wood';

export type TokenState = 'base' | 'track' | 'home_path' | 'finished';

export type GameMode = 'vs_ai' | 'pass_and_play' | 'online_room';

export type GamePhase =
  | 'lobby'          // Selecting player modes, counts, and difficulties
  | 'waiting_roll'   // Active player must roll the dice
  | 'rolling'        // Dice animation actively playing
  | 'selecting_move' // Dice rolled; waiting for player or AI to pick a token
  | 'moving'         // Token is animating step-by-step
  | 'turn_resolved'  // Move completed, evaluating captures or extra turns
  | 'game_over';     // Match completed; displaying winners podium

export interface Token {
  id: string;                  // e.g. "red-0", "blue-3"
  playerIndex: number;         // 0..3
  color: PlayerColor;          // 'red' | 'green' | 'yellow' | 'blue'
  tokenIndex: number;          // 0..3
  state: TokenState;           // 'base' | 'track' | 'home_path' | 'finished'
  stepCount: number;           // -1 (base), 0..50 (outer track), 51..55 (home path), 56 (center home)
  globalPos: number | null;    // 0..51 when on outer track, null otherwise
  isEligible: boolean;         // true if selectable for current dice roll
}

export interface Player {
  index: number;               // 0 (Red), 1 (Green), 2 (Yellow), 3 (Blue)
  name: string;                // Display name
  color: PlayerColor;          // Assigned quadrant color
  slotType: SlotType;          // 'local_human' | 'ai_bot' | 'remote_player'
  difficulty: AIDifficulty;    // Used when slotType === 'ai_bot'
  tokens: Token[];             // Array of 4 tokens
  tokensInBase: number;        // Count (0..4)
  tokensFinished: number;      // Count (0..4)
  hasWon: boolean;             // True when all 4 tokens reach step 56
  finishRank: number | null;   // 1 (1st), 2 (2nd), 3 (3rd), 4 (4th), null if active
  avatarId: string;            // Avatar visual identifier
  isActive: boolean;           // True if current turn belongs to this player
  isReady?: boolean;           // For multiplayer lobbies
}

export interface DiceState {
  currentValue: number;        // 1..6
  isRolling: boolean;          // Animation mutex lock
  consecutiveSixes: number;    // Count (0..3)
  eligibleTokenIds: string[];  // IDs of tokens that can legally move
  lastRolledTimestamp: number;
}

export interface MoveRecord {
  turnIndex: number;
  playerId: string;
  tokenId: string;
  diceValue: number;
  fromStep: number;
  toStep: number;
  fromGlobalPos: number | null;
  toGlobalPos: number | null;
  capturedTokenId: string | null;
  earnedExtraRoll: boolean;
  extraRollReason: 'rolled_six' | 'captured_opponent' | 'entered_home' | null;
  timestamp: number;
}

export interface GameState {
  id: string;                  // Unique match UUID
  mode: GameMode;              // 'vs_ai' | 'pass_and_play' | 'online_room'
  phase: GamePhase;            // Current game stage
  activePlayerIndex: number;   // 0..3
  players: Player[];           // 2, 3, or 4 players
  dice: DiceState;             // Current dice status
  turnCount: number;           // Total turns played
  winnerList: number[];        // Ordered player indices who have finished
  history: MoveRecord[];       // Audit log of all moves
  lastMove: MoveRecord | null; // Most recent action for highlight rendering
  soundEnabled: boolean;       // Audio mute flag
  hapticsEnabled: boolean;     // Vibration toggle
  theme: BoardTheme;           // Board skin
  roomCode?: string;           // 6-character room code for online games
}

export interface MatchConfig {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  theme?: BoardTheme;
  slots: {
    color: PlayerColor;
    name: string;
    type: SlotType;
    difficulty?: AIDifficulty;
  }[];
}

export interface DiceRollResult {
  value: number;
  consecutiveSixes: number;
  eligibleTokenIds: string[];
  isTurnForfeited: boolean;
  autoAdvance: boolean;
  nextPlayerIndex?: number;
}

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

export interface UserCareerStats {
  matchesPlayed: number;
  matchesWon: number;
  tokensCaptured: number;
  tokensHome: number;
  sixesRolled: number;
  winStreak: number;
  bestStreak: number;
  lastPlayedTimestamp: number;
}

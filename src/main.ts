import { LudoEngine } from './engine/LudoEngine';
import { SoundManager } from './audio/SoundManager';
import { LudoAI } from './ai/LudoAI';
import { DiceRenderer } from './ui/DiceRenderer';
import { BoardRenderer } from './ui/BoardRenderer';
import { TurnIndicator } from './ui/TurnIndicator';
import { DashboardView } from './ui/DashboardView';
import { OnlineLobbyModal } from './ui/OnlineLobbyModal';
import { VictoryModal } from './ui/VictoryModal';
import { StatsManager } from './ui/StatsManager';
import { EmoteManager } from './ui/EmoteManager';
import { RoomManager } from './network/RoomManager';
import { GameState, MatchConfig } from './engine/Types';

class LudoApp {
  private engine: LudoEngine;
  private sound: SoundManager;
  private ai: LudoAI;
  private stats: StatsManager;
  private emote: EmoteManager;

  private diceUI: DiceRenderer;
  private boardUI: BoardRenderer;
  private turnUI: TurnIndicator;
  private dashboardUI: DashboardView;
  private onlineLobbyUI: OnlineLobbyModal;
  private victoryUI: VictoryModal;
  private roomUI: RoomManager;

  private isAiActing: boolean = false;
  private lastMatchCaptures: number = 0;

  constructor() {
    this.engine = new LudoEngine();
    this.sound = new SoundManager();
    this.ai = new LudoAI();
    this.stats = new StatsManager();
    this.emote = new EmoteManager();

    this.dashboardUI = new DashboardView('dashboard-screen');
    this.onlineLobbyUI = new OnlineLobbyModal();
    this.diceUI = new DiceRenderer('dice-hub');
    this.boardUI = new BoardRenderer('board-viewport');
    this.turnUI = new TurnIndicator();
    this.victoryUI = new VictoryModal();
    this.roomUI = new RoomManager();

    this.initEmoteBar();
    this.bindCoreEvents();
    this.initAppFlow();
  }

  private initEmoteBar(): void {
    const container = document.getElementById('emote-container');
    if (container) {
      container.innerHTML = this.emote.renderQuickPicker();
      this.emote.bindPickerEvents();
    }
  }

  private bindCoreEvents(): void {
    // 1. Dashboard Launch Game (Solo vs AI, Pass and Play)
    this.dashboardUI.onLaunchGame((config) => {
      this.startMatch(config);
    });

    // 2. Dashboard Host Online Room
    this.dashboardUI.onHostRoom(async (hostName) => {
      try {
        const code = await this.roomUI.hostRoom(hostName);
        this.onlineLobbyUI.show(code, this.roomUI.getRoomSlots(), true);
      } catch (err) {
        alert('Failed to host room: ' + String(err));
      }
    });

    // 3. Dashboard Join Online Room
    this.dashboardUI.onJoinRoom(async (code, playerName) => {
      try {
        await this.roomUI.joinRoom(code, playerName);
        this.onlineLobbyUI.show(code, this.roomUI.getRoomSlots(), false);
      } catch (err) {
        alert('Could not connect to room ' + code + ': ' + String(err));
      }
    });

    // 4. Dashboard Theme Change
    this.dashboardUI.onThemeChange((theme) => {
      this.engine.setTheme(theme);
    });

    // 5. Online Lobby Actions
    this.onlineLobbyUI.onStartGame(() => {
      const config = this.roomUI.createOnlineMatchConfig(this.engine.getState().theme);
      const state = this.engine.startMatch(config);
      this.roomUI.hostStartGame(state, config);
      this.onlineLobbyUI.hide();
      this.showGameScreen();
      this.showRoomBadge(this.roomUI.getRoomCode() || '');
      this.updateGameModeBadge('online_room');
    });

    this.onlineLobbyUI.onToggleBot((slotIdx) => {
      this.roomUI.hostToggleSlotBot(slotIdx);
    });

    this.onlineLobbyUI.onReadyToggle((isReady) => {
      this.roomUI.sendReadyToggle(isReady);
    });

    this.onlineLobbyUI.onLeaveRoom(() => {
      this.roomUI.cleanup();
      this.showDashboardScreen();
    });

    // 6. Multiplayer Room Network Events
    this.roomUI.onRoomUpdated((slots, _canStart, roomCode) => {
      this.onlineLobbyUI.show(roomCode, slots, this.roomUI.getRole() === 'host');
    });

    this.roomUI.onGameStarted((config, initialState) => {
      this.engine.setFullState(initialState);
      this.onlineLobbyUI.hide();
      this.showGameScreen();
      this.showRoomBadge(this.roomUI.getRoomCode() || '');
      this.updateGameModeBadge(config.mode);
      this.renderState(initialState);
    });

    this.roomUI.onStateReceived((remoteState) => {
      this.engine.setFullState(remoteState);
      this.renderState(remoteState);
    });

    this.roomUI.onRollRequested((playerIndex) => {
      if (this.roomUI.getRole() === 'host') {
        const state = this.engine.getState();
        if (state.activePlayerIndex === playerIndex && state.phase === 'waiting_roll') {
          this.handleRoll();
        }
      }
    });

    this.roomUI.onMoveRequested((playerIndex, tokenId) => {
      if (this.roomUI.getRole() === 'host') {
        const state = this.engine.getState();
        if (state.activePlayerIndex === playerIndex && state.phase === 'selecting_move') {
          this.handleMoveToken(tokenId);
        }
      }
    });

    this.roomUI.onEmoteReceived((playerIndex, emoji, label) => {
      this.emote.displayEmote(playerIndex, emoji, label);
    });

    this.emote.onSendEmote((emoji, label) => {
      const activeIdx = this.roomUI.getLocalPlayerIndex();
      this.roomUI.sendEmote(emoji, label);
      this.emote.displayEmote(activeIdx, emoji, label);
    });

    // 7. Gameplay Dice & Token Click Events
    this.diceUI.onRoll(() => {
      this.handleRoll();
    });

    this.boardUI.onTokenClick((tokenId) => {
      this.handleMoveToken(tokenId);
    });

    // 8. Navigation & Controls
    document.getElementById('btn-back-dashboard')?.addEventListener('click', () => {
      this.showDashboardScreen();
    });

    document.getElementById('restart-match-btn')?.addEventListener('click', () => {
      const current = this.engine.getState();
      this.startMatch({
        mode: current.mode,
        playerCount: current.players.length as 2 | 3 | 4,
        theme: current.theme,
        slots: current.players.map((p) => ({
          color: p.color,
          name: p.name,
          type: p.slotType,
          difficulty: p.difficulty,
        })),
      });
    });

    const soundBtn = document.getElementById('sound-toggle-btn');
    soundBtn?.addEventListener('click', () => {
      const enabled = !this.sound.isEnabled();
      this.sound.setEnabled(enabled);
      this.engine.setSoundEnabled(enabled);
      if (soundBtn) {
        soundBtn.textContent = enabled ? '🔊' : '🔇';
      }
    });

    // Copy room link
    document.getElementById('copy-room-btn')?.addEventListener('click', () => {
      const code = this.roomUI.getRoomCode();
      if (code && typeof navigator !== 'undefined' && navigator.clipboard) {
        const shareUrl = `${window.location.origin}?room=${code}`;
        navigator.clipboard.writeText(shareUrl);
        alert(`Room link copied! (${shareUrl})`);
      }
    });

    // 9. Victory Modal Events
    this.victoryUI.onRematch(() => {
      const current = this.engine.getState();
      this.startMatch({
        mode: current.mode,
        playerCount: current.players.length as 2 | 3 | 4,
        theme: current.theme,
        slots: current.players.map((p) => ({
          color: p.color,
          name: p.name,
          type: p.slotType,
          difficulty: p.difficulty,
        })),
      });
    });

    this.victoryUI.onNewGame(() => {
      this.showDashboardScreen();
    });

    // 10. Engine State Subscription
    this.engine.subscribe((state) => {
      this.renderState(state);
      this.checkAndExecuteAITurn(state);
      if (this.roomUI.getRole() === 'host') {
        this.roomUI.broadcastState(state as GameState);
      }
    });
  }

  private initAppFlow(): void {
    // Check URL parameters for direct room join invite
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (roomParam) {
      const code = roomParam.trim().toUpperCase();
      this.roomUI.joinRoom(code, 'Guest').then(() => {
        this.onlineLobbyUI.show(code, this.roomUI.getRoomSlots(), false);
      }).catch((err) => {
        alert('Could not join room ' + code + ': ' + String(err));
        this.showDashboardScreen();
      });
    } else {
      this.showDashboardScreen();
    }
  }

  private startMatch(config: MatchConfig): void {
    this.lastMatchCaptures = 0;
    this.engine.startMatch(config);
    this.updateGameModeBadge(config.mode);
    this.showGameScreen();
  }

  private showDashboardScreen(): void {
    this.onlineLobbyUI.hide();
    this.victoryUI.hide();
    document.getElementById('game-screen')?.classList.add('hidden');
    this.dashboardUI.show(this.stats.getStats());
  }

  private showGameScreen(): void {
    this.dashboardUI.hide();
    this.onlineLobbyUI.hide();
    this.victoryUI.hide();
    document.getElementById('game-screen')?.classList.remove('hidden');
  }

  private handleRoll(): void {
    const state = this.engine.getState();
    const activePlayer = state.players[state.activePlayerIndex];

    if (state.phase !== 'waiting_roll') return;

    if (this.roomUI.getRole() === 'client') {
      if (activePlayer.index === this.roomUI.getLocalPlayerIndex()) {
        this.roomUI.sendRollRequest();
      }
      return;
    }

    if (activePlayer.slotType === 'ai_bot') return;

    this.sound.playDiceRoll();
    const result = this.engine.rollDice();

    this.diceUI.animateRoll(result.value, () => {
      if (result.autoAdvance && result.eligibleTokenIds.length === 0) {
        setTimeout(() => {
          this.engine.advanceTurn();
        }, 650);
      } else if (result.eligibleTokenIds.length === 1 && state.mode === 'vs_ai') {
        setTimeout(() => {
          this.handleMoveToken(result.eligibleTokenIds[0]);
        }, 300);
      }
    });
  }

  private handleMoveToken(tokenId: string): void {
    const state = this.engine.getState();
    const activePlayer = state.players[state.activePlayerIndex];

    if (state.phase !== 'selecting_move') return;

    if (this.roomUI.getRole() === 'client') {
      if (activePlayer.index === this.roomUI.getLocalPlayerIndex()) {
        this.roomUI.sendMoveRequest(tokenId);
      }
      return;
    }

    if (activePlayer.slotType === 'ai_bot') return;

    this.sound.playTokenStep();
    const result = this.engine.moveToken(tokenId);

    if (result.capturedToken) {
      this.lastMatchCaptures += 1;
      setTimeout(() => this.sound.playCapture(), 150);
    }
    if (result.enteredHome) {
      setTimeout(() => this.sound.playHomeEnter(), 150);
    }
    if (result.isGameOver) {
      this.handleGameOver();
    }
  }

  private checkAndExecuteAITurn(state: Readonly<GameState>): void {
    if (state.phase === 'game_over' || this.isAiActing) return;

    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.slotType !== 'ai_bot') return;

    // AI rolling step
    if (state.phase === 'waiting_roll') {
      this.isAiActing = true;
      const delay = this.ai.getThinkingDelay('roll', activePlayer.difficulty);

      setTimeout(() => {
        this.sound.playDiceRoll();
        const rollResult = this.engine.rollDice();

        this.diceUI.animateRoll(rollResult.value, () => {
          this.isAiActing = false;

          if (rollResult.autoAdvance && rollResult.eligibleTokenIds.length === 0) {
            setTimeout(() => {
              this.engine.advanceTurn();
            }, 600);
          }
        });
      }, delay);
    }

    // AI token selection step
    else if (state.phase === 'selecting_move') {
      this.isAiActing = true;
      const delay = this.ai.getThinkingDelay('move', activePlayer.difficulty);

      setTimeout(() => {
        const bestTokenId = this.ai.decideMove(
          state,
          state.activePlayerIndex,
          state.dice.eligibleTokenIds,
          activePlayer.difficulty
        );

        if (bestTokenId) {
          this.sound.playTokenStep();
          const result = this.engine.moveToken(bestTokenId);

          if (result.capturedToken) {
            this.lastMatchCaptures += 1;
            setTimeout(() => this.sound.playCapture(), 150);
          }
          if (result.enteredHome) {
            setTimeout(() => this.sound.playHomeEnter(), 150);
          }
          if (result.isGameOver) {
            this.handleGameOver();
          }
        }
        this.isAiActing = false;
      }, delay);
    }
  }

  private handleGameOver(): void {
    const state = this.engine.getState();
    const winnerIdx = state.winnerList[0];
    const isPlayerWin = winnerIdx === 0;

    const humanPlayer = state.players[0];
    const homeTokens = humanPlayer ? humanPlayer.tokensFinished : 0;
    const sixes = state.history.filter((h) => h.playerId === (humanPlayer?.name || 'You') && h.diceValue === 6).length;

    this.stats.recordMatchCompletion(isPlayerWin, this.lastMatchCaptures, homeTokens, sixes);

    setTimeout(() => {
      this.sound.playVictoryFanfare();
      this.victoryUI.show(this.engine.getState());
    }, 500);
  }

  private renderState(state: Readonly<GameState>): void {
    const activePlayer = state.players[state.activePlayerIndex];
    const isHumanTurn = activePlayer && (
      (this.roomUI.getRole() === 'standalone' && activePlayer.slotType === 'local_human') ||
      (this.roomUI.getRole() === 'host' && activePlayer.index === 0) ||
      (this.roomUI.getRole() === 'client' && activePlayer.index === this.roomUI.getLocalPlayerIndex())
    );
    const isAiThinking = activePlayer && activePlayer.slotType === 'ai_bot';

    this.boardUI.render(state);
    this.diceUI.update(state.dice, Boolean(isHumanTurn), Boolean(isAiThinking), state.phase);
    this.turnUI.update(state);
  }

  private updateGameModeBadge(mode: string): void {
    const badgeEl = document.getElementById('game-mode-badge');
    if (!badgeEl) return;

    if (mode === 'vs_ai') badgeEl.textContent = 'Vs Computer (AI)';
    else if (mode === 'pass_and_play') badgeEl.textContent = 'Pass and Play (Local)';
    else if (mode === 'online_room') badgeEl.textContent = 'Online Room (WebRTC)';
  }

  private showRoomBadge(code: string): void {
    const container = document.getElementById('room-badge-container');
    const display = document.getElementById('room-code-display');
    if (container && display) {
      display.textContent = code;
      container.classList.remove('hidden');
      container.classList.add('flex');
    }
  }
}

// Initialize Application once DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  new LudoApp();
});

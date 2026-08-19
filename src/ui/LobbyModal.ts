import { MatchConfig, GameMode, AIDifficulty, SlotType } from '../engine/Types';
import { COLOR_ORDER } from '../engine/BoardTopology';

export class LobbyModal {
  private overlayEl: HTMLElement | null;
  private modalEl: HTMLElement | null;
  private onStartMatchCallback: ((config: MatchConfig) => void) | null = null;
  private onCreateRoomCallback: (() => void) | null = null;
  private onJoinRoomCallback: ((code: string) => void) | null = null;

  private currentMode: GameMode = 'vs_ai';
  private playerCount: 2 | 3 | 4 = 4;
  private aiDifficulty: AIDifficulty = 'strategic';

  constructor() {
    this.overlayEl = document.getElementById('modal-overlay');
    this.modalEl = document.getElementById('lobby-modal');
  }

  public onStartMatch(cb: (config: MatchConfig) => void): void {
    this.onStartMatchCallback = cb;
  }

  public onCreateRoom(cb: () => void): void {
    this.onCreateRoomCallback = cb;
  }

  public onJoinRoom(cb: (code: string) => void): void {
    this.onJoinRoomCallback = cb;
  }

  public show(): void {
    if (!this.overlayEl || !this.modalEl) return;
    this.render();
    this.overlayEl.classList.remove('hidden');
    this.modalEl.classList.remove('hidden');
  }

  public hide(): void {
    if (this.overlayEl && this.modalEl) {
      this.modalEl.classList.add('hidden');
      this.overlayEl.classList.add('hidden');
    }
  }

  private render(): void {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
          🎲 Game Setup
        </h2>
        <button id="lobby-close-btn" class="text-zinc-400 hover:text-white text-lg p-1">✕</button>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="grid grid-cols-3 gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 mb-4 text-xs font-semibold">
        <button id="tab-vs-ai" class="py-2 rounded-lg transition-all ${this.currentMode === 'vs_ai' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}">
          Vs AI Bots
        </button>
        <button id="tab-pass-play" class="py-2 rounded-lg transition-all ${this.currentMode === 'pass_and_play' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}">
          Pass & Play
        </button>
        <button id="tab-online" class="py-2 rounded-lg transition-all ${this.currentMode === 'online_room' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}">
          Online Room
        </button>
      </div>

      <!-- Mode Specific Settings -->
      ${this.renderModeSettings()}
    `;

    this.bindEvents();
  }

  private renderModeSettings(): string {
    if (this.currentMode === 'online_room') {
      return `
        <div class="space-y-4 mb-6">
          <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-300">
            <p class="font-bold text-white mb-1">🌐 Serverless Peer-to-Peer Play</p>
            <p class="text-zinc-400 text-[11px]">Host a room and share your code, or join a friend's match. Unfilled seats are automatically played by AI bots!</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button id="btn-create-room" class="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
              👑 Host New Room
            </button>
            <div class="flex flex-col gap-2">
              <input id="input-room-code" type="text" maxlength="6" placeholder="ROOM CODE" class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-center font-mono font-bold text-xs uppercase text-white placeholder:text-zinc-600" />
              <button id="btn-join-room" class="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 active:scale-95 transition-all">
                Join Match
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <!-- Player Count -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-zinc-300 mb-1.5 uppercase font-mono tracking-wider">Players</label>
        <div class="grid grid-cols-3 gap-2">
          ${[2, 3, 4]
            .map(
              (count) => `
              <button data-player-count="${count}" class="player-count-btn py-2 rounded-xl text-xs font-bold border transition-all ${
                this.playerCount === count
                  ? 'bg-zinc-800 border-rose-500 text-white shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }">
                ${count} Players
              </button>
            `
            )
            .join('')}
        </div>
      </div>

      <!-- AI Difficulty (Vs AI Mode Only) -->
      ${
        this.currentMode === 'vs_ai'
          ? `
        <div class="mb-5">
          <label class="block text-xs font-bold text-zinc-300 mb-1.5 uppercase font-mono tracking-wider">Bot Strategy</label>
          <div class="grid grid-cols-3 gap-2">
            ${(['casual', 'balanced', 'strategic'] as AIDifficulty[])
              .map(
                (diff) => `
                <button data-difficulty="${diff}" class="difficulty-btn py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  this.aiDifficulty === diff
                    ? 'bg-zinc-800 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }">
                  ${diff}
                </button>
              `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <button id="btn-start-match" class="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-500/25 active:scale-95 transition-all">
        START MATCH
      </button>
    `;
  }

  private bindEvents(): void {
    // Close button
    document.getElementById('lobby-close-btn')?.addEventListener('click', () => this.hide());

    // Tab buttons
    document.getElementById('tab-vs-ai')?.addEventListener('click', () => {
      this.currentMode = 'vs_ai';
      this.render();
    });
    document.getElementById('tab-pass-play')?.addEventListener('click', () => {
      this.currentMode = 'pass_and_play';
      this.render();
    });
    document.getElementById('tab-online')?.addEventListener('click', () => {
      this.currentMode = 'online_room';
      this.render();
    });

    // Player count buttons
    document.querySelectorAll('.player-count-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const count = Number((e.currentTarget as HTMLElement).dataset.playerCount) as 2 | 3 | 4;
        this.playerCount = count;
        this.render();
      });
    });

    // AI Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const diff = (e.currentTarget as HTMLElement).dataset.difficulty as AIDifficulty;
        this.aiDifficulty = diff;
        this.render();
      });
    });

    // Start local / vs AI match
    document.getElementById('btn-start-match')?.addEventListener('click', () => {
      const config = this.buildMatchConfig();
      this.hide();
      if (this.onStartMatchCallback) {
        this.onStartMatchCallback(config);
      }
    });

    // Online room buttons
    document.getElementById('btn-create-room')?.addEventListener('click', () => {
      this.hide();
      if (this.onCreateRoomCallback) this.onCreateRoomCallback();
    });

    document.getElementById('btn-join-room')?.addEventListener('click', () => {
      const input = document.getElementById('input-room-code') as HTMLInputElement;
      const code = input ? input.value.trim().toUpperCase() : '';
      if (code.length === 6) {
        this.hide();
        if (this.onJoinRoomCallback) this.onJoinRoomCallback(code);
      } else {
        alert('Please enter a valid 6-character room code');
      }
    });
  }

  private buildMatchConfig(): MatchConfig {
    const activeColors = COLOR_ORDER.slice(0, this.playerCount);

    const slots = activeColors.map((color, idx) => {
      let type: SlotType = 'local_human';

      if (this.currentMode === 'vs_ai') {
        type = idx === 0 ? 'local_human' : 'ai_bot';
      }

      const name = type === 'local_human' ? (idx === 0 ? 'You' : `Player ${idx + 1}`) : `Bot ${idx}`;

      return {
        color,
        name,
        type,
        difficulty: this.aiDifficulty,
      };
    });

    return {
      mode: this.currentMode,
      playerCount: this.playerCount,
      slots,
    };
  }
}

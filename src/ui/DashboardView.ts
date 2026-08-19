import { GameMode, AIDifficulty, BoardTheme, MatchConfig, UserCareerStats } from '../engine/Types';
import { COLOR_ORDER } from '../engine/BoardTopology';

export class DashboardView {
  private containerEl: HTMLElement | null = null;
  private onLaunchGameCallback: ((config: MatchConfig) => void) | null = null;
  private onHostRoomCallback: ((hostName: string) => void) | null = null;
  private onJoinRoomCallback: ((roomCode: string, playerName: string) => void) | null = null;
  private onThemeChangeCallback: ((theme: BoardTheme) => void) | null = null;

  // Selected Dashboard Form States
  private vsAiPlayerCount: 2 | 3 | 4 = 4;
  private vsAiDifficulty: AIDifficulty = 'strategic';
  private localPlayerCount: 2 | 3 | 4 = 4;
  private selectedTheme: BoardTheme = 'obsidian';

  constructor(containerId: string = 'dashboard-screen') {
    this.containerEl = document.getElementById(containerId);
  }

  public onLaunchGame(cb: (config: MatchConfig) => void): void {
    this.onLaunchGameCallback = cb;
  }

  public onHostRoom(cb: (hostName: string) => void): void {
    this.onHostRoomCallback = cb;
  }

  public onJoinRoom(cb: (roomCode: string, playerName: string) => void): void {
    this.onJoinRoomCallback = cb;
  }

  public onThemeChange(cb: (theme: BoardTheme) => void): void {
    this.onThemeChangeCallback = cb;
  }

  public show(stats: UserCareerStats): void {
    if (!this.containerEl) return;
    this.render(stats);
    this.containerEl.classList.remove('hidden');
  }

  public hide(): void {
    if (this.containerEl) {
      this.containerEl.classList.add('hidden');
    }
  }

  public render(stats: UserCareerStats): void {
    if (!this.containerEl) return;

    const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;

    this.containerEl.innerHTML = `
      <div class="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-8 flex flex-col gap-5 md:gap-8">
        <!-- Hero Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-800/80 pb-4 sm:pb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 p-[2px] shadow-lg shadow-rose-500/20 shrink-0">
              <div class="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-black text-lg sm:text-xl text-white">
                🎲
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">LUDO <span class="text-rose-500">PRO</span></h1>
                <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">Realtime</span>
              </div>
              <p class="text-[11px] sm:text-xs text-zinc-400 font-medium">Smart AI Bots, Local Pass and Play, and Instant P2P Multiplayer</p>
            </div>
          </div>

          <!-- User Stats Badge -->
          <div class="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 rounded-2xl backdrop-blur-md">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-xs sm:text-sm shrink-0">
              👑
            </div>
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-2">
                <span>Champion</span>
                <span class="text-[10px] text-emerald-400 font-mono font-bold">${winRate}% Win Rate</span>
              </div>
              <div class="text-[10px] sm:text-[11px] text-zinc-400 font-mono">${stats.matchesWon} Won / ${stats.matchesPlayed} Matches</div>
            </div>
          </div>
        </div>

        <!-- Mode Selection Hub -->
        <div>
          <div class="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold mb-3 flex items-center gap-2">
            <span>Select Game Mode</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            <!-- Mode 1: Solo vs Smart AI -->
            <div class="mode-card group relative bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-xl backdrop-blur-md">
              <div class="mb-3 sm:mb-4">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3 text-rose-400">
                  🤖
                </div>
                <h3 class="text-base sm:text-lg font-bold text-white tracking-tight mb-1">Solo vs Smart AI</h3>
                <p class="text-xs text-zinc-400 leading-relaxed">Challenge adaptive bots powered by positional and strategic heuristics.</p>
              </div>

              <div class="space-y-3 pt-3 border-t border-zinc-800/80">
                <div>
                  <div class="text-[10px] font-mono text-zinc-400 mb-1.5 uppercase font-semibold">Player Count</div>
                  <div class="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    ${[2, 3, 4]
                      .map(
                        (cnt) => `
                      <button data-ai-count="${cnt}" class="btn-ai-count py-1 rounded-lg text-xs font-bold transition-all ${
                        this.vsAiPlayerCount === cnt ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                      }">${cnt}P</button>
                    `
                      )
                      .join('')}
                  </div>
                </div>

                <div>
                  <div class="text-[10px] font-mono text-zinc-400 mb-1.5 uppercase font-semibold">Bot Difficulty</div>
                  <div class="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    ${(['casual', 'balanced', 'strategic'] as AIDifficulty[])
                      .map(
                        (diff) => `
                      <button data-ai-diff="${diff}" class="btn-ai-diff py-1 rounded-lg text-[10.5px] font-bold capitalize transition-all ${
                        this.vsAiDifficulty === diff ? 'bg-amber-500 text-black shadow-sm font-black' : 'text-zinc-400 hover:text-zinc-200'
                      }">${diff === 'strategic' ? 'Master' : diff}</button>
                    `
                      )
                      .join('')}
                  </div>
                </div>

                <button id="btn-launch-ai" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
                  PLAY VS BOTS
                </button>
              </div>
            </div>

            <!-- Mode 2: Pass and Play (Local) -->
            <div class="mode-card group relative bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-xl backdrop-blur-md">
              <div class="mb-3 sm:mb-4">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3 text-emerald-400">
                  👥
                </div>
                <h3 class="text-base sm:text-lg font-bold text-white tracking-tight mb-1">Pass and Play</h3>
                <p class="text-xs text-zinc-400 leading-relaxed">Turn based local multiplayer on one screen for friends and family.</p>
              </div>

              <div class="space-y-3 pt-3 border-t border-zinc-800/80">
                <div>
                  <div class="text-[10px] font-mono text-zinc-400 mb-1.5 uppercase font-semibold">Total Players</div>
                  <div class="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    ${[2, 3, 4]
                      .map(
                        (cnt) => `
                      <button data-local-count="${cnt}" class="btn-local-count py-1 rounded-lg text-xs font-bold transition-all ${
                        this.localPlayerCount === cnt ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                      }">${cnt} Players</button>
                    `
                      )
                      .join('')}
                  </div>
                </div>

                <div class="p-2 sm:p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[10.5px] sm:text-[11px] text-zinc-400">
                  <span>Each player takes turns rolling on this device. Fully customizable color seats!</span>
                </div>

                <button id="btn-launch-local" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all">
                  START PASS AND PLAY
                </button>
              </div>
            </div>

            <!-- Mode 3: Realtime Online Rooms -->
            <div class="mode-card group relative bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-xl backdrop-blur-md">
              <div class="mb-3 sm:mb-4">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3 text-blue-400">
                  🌐
                </div>
                <h3 class="text-base sm:text-lg font-bold text-white tracking-tight mb-1">Online P2P Match</h3>
                <p class="text-xs text-zinc-400 leading-relaxed">Zero server lag WebRTC rooms. Share 6-character code or link.</p>
              </div>

              <div class="space-y-3 pt-3 border-t border-zinc-800/80">
                <button id="btn-host-online" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <span>👑</span>
                  <span>HOST ONLINE ROOM</span>
                </button>

                <div class="flex items-center gap-2">
                  <input id="input-join-code" type="text" maxlength="6" placeholder="ROOM CODE" class="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-center font-mono font-bold text-sm uppercase text-white placeholder:text-zinc-600 focus:border-blue-500 outline-none" />
                  <button id="btn-join-online" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 active:scale-95 transition-all shrink-0">
                    JOIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bento Grid: Stats and Themes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <!-- Career Stats Card -->
          <div class="md:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5">
            <div class="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold mb-3 sm:mb-4 flex items-center justify-between">
              <span>Career Performance</span>
              <span class="text-zinc-500 text-[10px]">Verified Offline Storage</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div class="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div class="text-lg font-black text-rose-400 font-mono">${stats.matchesWon}</div>
                <div class="text-[10px] text-zinc-400 font-mono mt-0.5">Victories</div>
              </div>
              <div class="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div class="text-lg font-black text-amber-400 font-mono">${stats.tokensCaptured}</div>
                <div class="text-[10px] text-zinc-400 font-mono mt-0.5">Captures</div>
              </div>
              <div class="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div class="text-lg font-black text-emerald-400 font-mono">${stats.tokensHome}</div>
                <div class="text-[10px] text-zinc-400 font-mono mt-0.5">Tokens Home</div>
              </div>
              <div class="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div class="text-lg font-black text-blue-400 font-mono">${stats.bestStreak}</div>
                <div class="text-[10px] text-zinc-400 font-mono mt-0.5">Best Streak</div>
              </div>
            </div>
          </div>

          <!-- Board Theme Selector -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div class="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold mb-3">
                Board Theme
              </div>
              <div class="grid grid-cols-2 gap-2">
                ${[
                  { id: 'obsidian', name: 'Obsidian Glass', icon: '🌑' },
                  { id: 'cyberpunk', name: 'Cyber Neon', icon: '⚡' },
                  { id: 'royal_glass', name: 'Royal Sapphire', icon: '💎' },
                  { id: 'classic_wood', name: 'Classic Luxe', icon: '🪵' },
                ]
                  .map(
                    (th) => `
                  <button data-theme="${th.id}" class="theme-select-btn p-2 rounded-xl text-left border transition-all ${
                      this.selectedTheme === th.id
                        ? 'bg-zinc-800 border-rose-500 text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                    }">
                    <div class="text-sm">${th.icon}</div>
                    <div class="text-[11px] font-bold mt-1 text-white">${th.name}</div>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Rules & Quick Guide Dropdown -->
        <div class="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5">
          <div class="flex items-center justify-between cursor-pointer" id="rules-toggle-header">
            <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
              <span>📖</span>
              <span>Official Rules and Quick Guide</span>
            </div>
            <span id="rules-toggle-icon" class="text-xs text-zinc-500 font-bold">▼</span>
          </div>

          <div id="rules-content" class="hidden mt-4 pt-4 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-zinc-400">
            <div class="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
              <strong class="text-white block mb-1">1. Entering Board</strong>
              Roll a 6 to move any token from your home yard to the starting tile.
            </div>
            <div class="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
              <strong class="text-white block mb-1">2. Safe Star Tiles</strong>
              Tiles marked with purple stars (★) are safe zones where tokens cannot be captured.
            </div>
            <div class="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
              <strong class="text-white block mb-1">3. Knockouts and Bonus</strong>
              Landing on an opponent sends them back to their yard and awards you an extra roll!
            </div>
            <div class="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
              <strong class="text-white block mb-1">4. 3 Consecutive Sixes</strong>
              Rolling three 6s in a row passes your turn immediately to prevent runaway turns.
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Player count buttons for AI mode
    document.querySelectorAll('.btn-ai-count').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const count = Number((e.currentTarget as HTMLElement).dataset.aiCount) as 2 | 3 | 4;
        this.vsAiPlayerCount = count;
        document.querySelectorAll('.btn-ai-count').forEach((b) => {
          b.className = `btn-ai-count py-1 rounded-lg text-xs font-bold transition-all ${
            Number((b as HTMLElement).dataset.aiCount) === count ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`;
        });
      });
    });

    // AI Difficulty buttons
    document.querySelectorAll('.btn-ai-diff').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const diff = (e.currentTarget as HTMLElement).dataset.aiDiff as AIDifficulty;
        this.vsAiDifficulty = diff;
        document.querySelectorAll('.btn-ai-diff').forEach((b) => {
          b.className = `btn-ai-diff py-1 rounded-lg text-[10.5px] font-bold capitalize transition-all ${
            (b as HTMLElement).dataset.aiDiff === diff ? 'bg-amber-500 text-black shadow-sm font-black' : 'text-zinc-400 hover:text-zinc-200'
          }`;
        });
      });
    });

    // Launch AI match
    document.getElementById('btn-launch-ai')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('vs_ai', this.vsAiPlayerCount, this.vsAiDifficulty);
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    // Player count buttons for Local mode
    document.querySelectorAll('.btn-local-count').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const count = Number((e.currentTarget as HTMLElement).dataset.localCount) as 2 | 3 | 4;
        this.localPlayerCount = count;
        document.querySelectorAll('.btn-local-count').forEach((b) => {
          b.className = `btn-local-count py-1 rounded-lg text-xs font-bold transition-all ${
            Number((b as HTMLElement).dataset.localCount) === count ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`;
        });
      });
    });

    // Launch Local match
    document.getElementById('btn-launch-local')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('pass_and_play', this.localPlayerCount);
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    // Host Online Room
    document.getElementById('btn-host-online')?.addEventListener('click', () => {
      if (this.onHostRoomCallback) this.onHostRoomCallback('Host (You)');
    });

    // Join Online Room
    document.getElementById('btn-join-online')?.addEventListener('click', () => {
      const input = document.getElementById('input-join-code') as HTMLInputElement;
      const code = input ? input.value.trim().toUpperCase() : '';
      if (code.length === 6) {
        if (this.onJoinRoomCallback) this.onJoinRoomCallback(code, 'Guest');
      } else {
        alert('Please enter a 6-character room code.');
      }
    });

    // Theme selector
    document.querySelectorAll('.theme-select-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const theme = (e.currentTarget as HTMLElement).dataset.theme as BoardTheme;
        this.selectedTheme = theme;
        document.querySelectorAll('.theme-select-btn').forEach((b) => {
          const isSelected = (b as HTMLElement).dataset.theme === theme;
          b.className = `theme-select-btn p-2 rounded-xl text-left border transition-all ${
            isSelected ? 'bg-zinc-800 border-rose-500 text-white shadow-sm' : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
          }`;
        });
        if (this.onThemeChangeCallback) this.onThemeChangeCallback(theme);
      });
    });

    // Rules toggle accordion
    const rulesHeader = document.getElementById('rules-toggle-header');
    const rulesContent = document.getElementById('rules-content');
    const rulesIcon = document.getElementById('rules-toggle-icon');
    rulesHeader?.addEventListener('click', () => {
      if (rulesContent && rulesIcon) {
        const isHidden = rulesContent.classList.contains('hidden');
        rulesContent.classList.toggle('hidden', !isHidden);
        rulesIcon.textContent = isHidden ? '▲' : '▼';
      }
    });
  }

  private buildMatchConfig(mode: GameMode, playerCount: 2 | 3 | 4, aiDifficulty: AIDifficulty = 'strategic'): MatchConfig {
    const activeColors = COLOR_ORDER.slice(0, playerCount);

    const slots = activeColors.map((color, idx) => {
      let type: import('../engine/Types').SlotType = 'local_human';
      if (mode === 'vs_ai') {
        type = idx === 0 ? 'local_human' : 'ai_bot';
      }

      const name = type === 'local_human' ? (idx === 0 ? 'You' : `Player ${idx + 1}`) : `Bot ${idx}`;

      return {
        color,
        name,
        type,
        difficulty: aiDifficulty,
      };
    });

    return {
      mode,
      playerCount,
      theme: this.selectedTheme,
      slots,
    };
  }
}

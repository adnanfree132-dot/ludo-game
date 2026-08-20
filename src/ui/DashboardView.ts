import { GameMode, AIDifficulty, BoardTheme, MatchConfig, UserCareerStats } from '../engine/Types';
import { COLOR_ORDER } from '../engine/BoardTopology';

export class DashboardView {
  private containerEl: HTMLElement | null = null;
  private onLaunchGameCallback: ((config: MatchConfig) => void) | null = null;
  private onHostRoomCallback: ((hostName: string) => void) | null = null;
  private onJoinRoomCallback: ((roomCode: string, playerName: string) => void) | null = null;
  private onThemeChangeCallback: ((theme: BoardTheme) => void) | null = null;

  // Selected Dashboard Form States
  private selectedTheme: BoardTheme = 'obsidian';

  // Stopwatch state
  private timerSeconds: number = 5048; // 01:24:08 initial from reference
  private timerInterval: any = null;
  private isTimerRunning: boolean = true;

  constructor(containerId: string = 'dashboard-screen') {
    this.containerEl = document.getElementById(containerId);
    this.startStopwatch();
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

  private formatTime(totalSeconds: number): string {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private startStopwatch(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isTimerRunning) {
        this.timerSeconds++;
        const el = document.getElementById('time-tracker-clock');
        if (el) {
          el.textContent = this.formatTime(this.timerSeconds);
        }
      }
    }, 1000);
  }

  public render(stats: UserCareerStats): void {
    if (!this.containerEl) return;

    const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 75;
    const matchesCount = stats.matchesPlayed > 0 ? stats.matchesPlayed : 24;
    const wonCount = stats.matchesWon > 0 ? stats.matchesWon : 18;
    const capturesCount = stats.tokensCaptured > 0 ? stats.tokensCaptured : 42;
    const homeCount = stats.tokensHome > 0 ? stats.tokensHome : 56;

    this.containerEl.innerHTML = `
      <div class="donezo-app-frame">
        <div class="donezo-dashboard-card">
          <!-- LEFT SIDEBAR -->
          <aside class="donezo-sidebar">
            <div class="flex flex-col gap-6">
              <!-- Brand Logo -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 border border-emerald-400/40 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 text-lg">
                  🎲
                </div>
                <div class="flex flex-col">
                  <span class="text-xl font-black text-white tracking-tight leading-none">LUDO PRO</span>
                  <span class="text-[9.5px] font-black text-emerald-400 tracking-widest uppercase mt-0.5">BATTLE ARENA</span>
                </div>
              </div>

              <!-- Nav Groups -->
              <div class="flex flex-col gap-6">
                <!-- MENU -->
                <div>
                  <div class="text-[10.5px] font-black text-slate-500 tracking-widest uppercase mb-2.5 px-1">Game Menu</div>
                  <nav class="flex flex-col gap-1.5">
                    <a href="#" class="sidebar-nav-item active">
                      <span class="text-base">🎯</span>
                      <span>Play Arena</span>
                    </a>
                    <a href="#modes-section" class="sidebar-nav-item" id="nav-ai-mode">
                      <span class="text-base">🤖</span>
                      <span>Solo vs AI</span>
                      <span class="ml-auto text-[9.5px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">BOT</span>
                    </a>
                    <a href="#modes-section" class="sidebar-nav-item" id="nav-local-mode">
                      <span class="text-base">👥</span>
                      <span>Pass & Play</span>
                    </a>
                    <a href="#modes-section" class="sidebar-nav-item" id="nav-online-mode">
                      <span class="text-base">🌐</span>
                      <span>Online Rooms</span>
                      <span class="ml-auto text-[9.5px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">P2P</span>
                    </a>
                    <a href="#team-section" class="sidebar-nav-item">
                      <span class="text-base">🏆</span>
                      <span>Leaderboards</span>
                      <span class="ml-auto text-[9.5px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">#4</span>
                    </a>
                  </nav>
                </div>

                <!-- GENERAL -->
                <div>
                  <div class="text-[10.5px] font-black text-slate-500 tracking-widest uppercase mb-2.5 px-1">Settings & Surface</div>
                  <nav class="flex flex-col gap-1.5">
                    <a href="#theme-section" class="sidebar-nav-item">
                      <span class="text-base">🎨</span>
                      <span>Board Themes</span>
                    </a>
                    <a href="#rules-section" class="sidebar-nav-item" id="nav-rules-btn">
                      <span class="text-base">📖</span>
                      <span>Rules & Tactics</span>
                    </a>
                  </nav>
                </div>
              </div>
            </div>

            <!-- Bottom Left Promo Card -->
            <div class="wavy-time-card p-4 rounded-2xl mt-6 hidden md:flex flex-col justify-between gap-3 relative overflow-hidden">
              <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">
                📱
              </div>
              <div>
                <h4 class="text-sm font-bold text-white leading-tight">Mobile PWA Ready</h4>
                <p class="text-[11px] text-emerald-200/80 mt-0.5">Zero-lag WebRTC multiplayer</p>
              </div>
              <button id="btn-sidebar-download" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95">
                ⚔️ Instant Battle vs AI
              </button>
            </div>
          </aside>

          <!-- MAIN CONTENT PANEL -->
          <main class="donezo-main">
            <!-- TOP BAR -->
            <header class="donezo-top-bar">
              <!-- Search Input -->
              <div class="flex-1 max-w-md relative">
                <div class="flex items-center bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-xs text-white gap-2.5 focus-within:border-emerald-500/50 focus-within:bg-white/[0.06] transition-all shadow-inner">
                  <span class="text-emerald-400 text-sm">🔍</span>
                  <input id="input-top-room-code" type="text" maxlength="6" placeholder="Enter 6-char room code or search..." class="bg-transparent outline-none w-full text-xs font-semibold placeholder:text-slate-500 uppercase text-white" />
                  <span class="hidden sm:inline text-[10px] font-mono font-bold bg-white/10 text-slate-400 border border-white/10 px-1.5 py-0.5 rounded shadow-sm">Ctrl+K</span>
                </div>
              </div>

              <!-- Profile & Header Actions -->
              <div class="flex items-center gap-3">
                <!-- Level Badge -->
                <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[11px] font-extrabold text-amber-300 shadow-sm">
                  <span>👑</span>
                  <span>LVL 42</span>
                </div>

                <!-- Profile Pill -->
                <div class="flex items-center gap-3 pl-2 border-l border-white/10">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-base font-black shadow-lg gaming-glow-avatar">
                    🎯
                  </div>
                  <div class="hidden sm:block text-left">
                    <div class="text-xs font-bold text-white leading-none">Grandmaster Adnan</div>
                    <div class="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">2,450 ELO • Master Division</div>
                  </div>
                </div>
              </div>
            </header>

            <!-- BODY CONTENT -->
            <div class="donezo-content">
              <!-- PAGE TITLE & HERO ACTIONS -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <span class="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">⚔️ Battle Arena</span>
                    <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest font-mono">Rank #4</span>
                  </h1>
                  <p class="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Roll high, capture tokens, dominate safe zones, and rule the 4-color board.</p>
                </div>

                <div class="flex items-center gap-3 w-full sm:w-auto">
                  <button id="btn-hero-host-room" class="bento-btn-primary flex-1 sm:flex-none">
                    <span class="text-base leading-none font-bold">+</span>
                    <span>Host Online Room</span>
                  </button>
                  <button id="btn-hero-join-room" class="bento-btn-outline flex-1 sm:flex-none">
                    <span>🔗 Join by Code</span>
                  </button>
                </div>
              </div>

              <!-- ROW 1: 4 TOP KPI METRIC CARDS -->
              <div class="donezo-kpi-row" id="stats-section">
                <!-- Card 1: Career Battles (Deep Emerald Hero Card) -->
                <div class="bento-emerald-card p-5 cursor-pointer" id="kpi-card-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold text-emerald-200 uppercase tracking-wider">Career Battles</span>
                    <div class="arrow-circle-btn-white">↗</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-white tracking-tight font-mono">${matchesCount}</div>
                    <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                      <span class="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[11px] font-bold">+5</span>
                      <span>Matches Played This Week</span>
                    </div>
                  </div>
                </div>

                <!-- Card 2: Victories Won -->
                <div class="bento-card p-5 cursor-pointer" id="kpi-card-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Victories Won</span>
                    <div class="arrow-circle-btn">↗</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-white tracking-tight font-mono">${wonCount}</div>
                    <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] font-bold">🏆 ${winRate}%</span>
                      <span>Win Rate Overall</span>
                    </div>
                  </div>
                </div>

                <!-- Card 3: Enemy Knockouts -->
                <div class="bento-card p-5 cursor-pointer" id="kpi-card-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Enemy Knockouts</span>
                    <div class="arrow-circle-btn">↗</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-white tracking-tight font-mono">${capturesCount}</div>
                    <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <span class="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px] font-bold">⚡ ${stats.bestStreak || 4}</span>
                      <span>Best Win Streak</span>
                    </div>
                  </div>
                </div>

                <!-- Card 4: Tokens Home -->
                <div class="bento-card p-5 cursor-pointer" id="kpi-card-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tokens Home</span>
                    <div class="arrow-circle-btn">↗</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-white tracking-tight font-mono">${homeCount}</div>
                    <div class="mt-3 text-xs text-slate-400 font-medium">
                      <span>🏁 Top 5% Board Conqueror</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- MAIN BENTO 2-COLUMN GRID (Left 1.85fr, Right 1fr) -->
              <div class="donezo-bento-grid">
                <!-- LEFT COLUMN -->
                <div class="donezo-left-column">
                  <!-- SUB-ROW 1: Dice Analytics + Next Match -->
                  <div class="donezo-left-top-row">
                    <!-- Dice Rolls Analytics (Pill Bar Chart) -->
                    <div class="bento-card p-5" id="analytics-section">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-bold text-white tracking-tight">Dice Sixes Telemetry</span>
                        <span class="text-xs font-mono text-emerald-400 font-bold">Weekly Stats</span>
                      </div>

                      <!-- 7 Pill Bars: S M T W T F S -->
                      <div class="flex items-end justify-between h-36 pt-4 px-2">
                        <!-- S -->
                        <div class="flex flex-col items-center gap-2">
                          <div class="w-8 h-20 rounded-full pill-bar-striped" title="Sunday: 12 Sixes"></div>
                          <span class="text-xs font-semibold text-slate-400 font-mono">S</span>
                        </div>
                        <!-- M -->
                        <div class="flex flex-col items-center gap-2">
                          <div class="w-8 h-28 rounded-full pill-bar-solid-dark" title="Monday: 28 Sixes"></div>
                          <span class="text-xs font-semibold text-slate-400 font-mono">M</span>
                        </div>
                        <!-- T (with 75% Tooltip) -->
                        <div class="flex flex-col items-center gap-2 relative">
                          <div class="absolute -top-6 px-1.5 py-0.5 rounded-full bg-slate-900 text-emerald-300 border border-emerald-500/40 font-mono text-[9px] font-bold shadow-lg">75% Luck</div>
                          <div class="w-8 h-24 rounded-full pill-bar-solid-mint" title="Tuesday: Peak 75% Luck"></div>
                          <span class="text-xs font-bold text-emerald-300 font-mono">T</span>
                        </div>
                        <!-- W -->
                        <div class="flex flex-col items-center gap-2">
                          <div class="w-8 h-32 rounded-full pill-bar-solid-dark" title="Wednesday: 34 Sixes"></div>
                          <span class="text-xs font-semibold text-slate-400 font-mono">W</span>
                        </div>
                        <!-- T -->
                        <div class="flex flex-col items-center gap-2">
                          <div class="w-8 h-16 rounded-full pill-bar-striped" title="Thursday: 16 Sixes"></div>
                          <span class="text-xs font-semibold text-slate-400 font-mono">T</span>
                        </div>
                        <!-- F -->
                        <div class="flex flex-col items-center gap-2">
                          <div class="w-8 h-24 rounded-full pill-bar-striped" title="Friday: 24 Sixes"></div>
                          <span class="text-xs font-semibold text-slate-400 font-mono">F</span>
                        </div>
                        <!-- S -->
                        <div class="flex flex-col items-center gap-2">
                          <div class="w-8 h-20 rounded-full pill-bar-striped" title="Saturday: 20 Sixes"></div>
                          <span class="text-xs font-semibold text-slate-400 font-mono">S</span>
                        </div>
                      </div>
                    </div>

                    <!-- Next Match Arena Card -->
                    <div class="bento-card p-5 flex flex-col justify-between gap-3">
                      <div>
                        <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tournament Matchup</div>
                        <h3 class="text-base font-extrabold text-white mt-1.5 leading-snug">Grand Final vs AI Master</h3>
                        <p class="text-xs text-slate-400 mt-1 font-medium">4 Players • Strategic Bots • Safe Zones</p>
                      </div>

                      <button id="btn-start-meeting" class="bento-btn-primary w-full py-3 mt-auto">
                        <span>⚔️</span>
                        <span>Start Instant Match</span>
                      </button>
                    </div>
                  </div>

                  <!-- SUB-ROW 2: Active Lobby & Board Conquest Progress -->
                  <div class="donezo-left-bottom-row" id="team-section">
                    <!-- Squad & Opponents -->
                    <div class="bento-card p-5">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-bold text-white tracking-tight">Active Squad & Rivals</span>
                        <span class="text-xs font-bold text-slate-400 border border-white/10 px-2.5 py-0.5 rounded-full">4 Slots</span>
                      </div>

                      <div class="space-y-3 text-xs">
                        <!-- Member 1 -->
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">🔴</div>
                            <div class="truncate">
                              <div class="font-bold text-white truncate">Crimson Champion (You)</div>
                              <div class="text-[10px] text-slate-400 truncate">Base Yard Alpha • <span class="font-medium text-emerald-400">Offensive</span></div>
                            </div>
                          </div>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">Ready</span>
                        </div>

                        <!-- Member 2 -->
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">🟢</div>
                            <div class="truncate">
                              <div class="font-bold text-white truncate">Emerald AI Titan</div>
                              <div class="text-[10px] text-slate-400 truncate">Safe-Zone Pathing • <span class="font-medium text-emerald-400">Adaptive</span></div>
                            </div>
                          </div>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">In Game</span>
                        </div>

                        <!-- Member 3 -->
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">🟡</div>
                            <div class="truncate">
                              <div class="font-bold text-white truncate">Golden Striker Bot</div>
                              <div class="text-[10px] text-slate-400 truncate">Bonus Sixes Hunter • <span class="font-medium text-emerald-400">Aggressive</span></div>
                            </div>
                          </div>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">Waiting</span>
                        </div>

                        <!-- Member 4 -->
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">🔵</div>
                            <div class="truncate">
                              <div class="font-bold text-white truncate">Royal Peer (Online)</div>
                              <div class="text-[10px] text-slate-400 truncate">WebRTC P2P Room • <span class="font-medium text-cyan-400">Connected</span></div>
                            </div>
                          </div>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">Connected</span>
                        </div>
                      </div>
                    </div>

                    <!-- Board Conquest Progress (Donut Gauge) -->
                    <div class="bento-card p-5 flex flex-col justify-between">
                      <div class="text-sm font-bold text-white tracking-tight">Board Conquest Dominance</div>

                      <!-- Semi-Circle Gauge SVG -->
                      <div class="flex flex-col items-center justify-center my-auto py-1">
                        <div class="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                          <svg viewBox="0 0 200 115" class="w-44 h-24">
                            <!-- Background Track -->
                            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="22" stroke-linecap="round" />
                            <!-- Completed Segment (Deep Emerald) -->
                            <path d="M 20 100 A 80 80 0 0 1 130 25" fill="none" stroke="#10b981" stroke-width="22" stroke-linecap="round" />
                            <!-- In Progress Segment (Mint) -->
                            <path d="M 130 25 A 80 80 0 0 1 160 50" fill="none" stroke="#06b6d4" stroke-width="22" stroke-linecap="round" />
                            <!-- Pending Segment (Striped/Gray) -->
                            <path d="M 160 50 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="22" stroke-linecap="round" />
                          </svg>
                        </div>
                        <div class="text-center -mt-8">
                          <div class="text-3xl font-extrabold text-white font-mono leading-none">${winRate}%</div>
                          <div class="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Victories Achieved</div>
                        </div>
                      </div>

                      <!-- Legend -->
                      <div class="flex items-center justify-center gap-3 pt-2 border-t border-white/10 text-[10px] text-slate-400 font-medium">
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Won</span>
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></span> Active</span>
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-white/30"></span> Losses</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- RIGHT COLUMN (Game Modes List + Match Clock) -->
                <div class="donezo-right-column" id="modes-section">
                  <!-- Game Modes Selection -->
                  <div class="bento-card p-5">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-bold text-white tracking-tight">Game Modes Hub</span>
                      <span class="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">4 Modes</span>
                    </div>

                    <div class="space-y-2.5 text-xs">
                      <!-- Mode 1: Solo AI -->
                      <div class="gaming-mode-card project-task-row" data-task="api">
                        <div class="flex items-center gap-3">
                          <span class="text-xl">🤖</span>
                          <div class="flex-1 min-w-0">
                            <div class="font-bold text-white truncate">Solo vs Smart AI</div>
                            <div class="text-[10.5px] text-slate-400 font-medium">4 Players • Adaptive bots</div>
                          </div>
                        </div>
                        <button class="gaming-play-btn">Play</button>
                      </div>

                      <!-- Mode 2: Pass & Play -->
                      <div class="gaming-mode-card project-task-row" data-task="onboarding">
                        <div class="flex items-center gap-3">
                          <span class="text-xl">👥</span>
                          <div class="flex-1 min-w-0">
                            <div class="font-bold text-white truncate">Pass and Play</div>
                            <div class="text-[10.5px] text-slate-400 font-medium">Local multiplayer on screen</div>
                          </div>
                        </div>
                        <button class="gaming-play-btn">Play</button>
                      </div>

                      <!-- Mode 3: Online P2P -->
                      <div class="gaming-mode-card project-task-row" data-task="dashboard">
                        <div class="flex items-center gap-3">
                          <span class="text-xl">🌐</span>
                          <div class="flex-1 min-w-0">
                            <div class="font-bold text-white truncate">Online P2P Match</div>
                            <div class="text-[10.5px] text-slate-400 font-medium">Real players • Zero lag</div>
                          </div>
                        </div>
                        <button class="gaming-play-btn">Host</button>
                      </div>

                      <!-- Mode 4: Blitz Rush -->
                      <div class="gaming-mode-card project-task-row" data-task="optimize">
                        <div class="flex items-center gap-3">
                          <span class="text-xl">⚡</span>
                          <div class="flex-1 min-w-0">
                            <div class="font-bold text-white truncate">Blitz Rush Match</div>
                            <div class="text-[10.5px] text-slate-400 font-medium">20s Fast Turn Timer</div>
                          </div>
                        </div>
                        <button class="gaming-play-btn">Play</button>
                      </div>
                    </div>
                  </div>

                  <!-- Turn & Match Stopwatch (Wavy Topo Card) -->
                  <div class="wavy-time-card p-5">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-white uppercase tracking-wider">Turn & Match Clock</span>
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/80"></span>
                    </div>

                    <div class="my-auto text-center py-4">
                      <div id="time-tracker-clock" class="text-4xl font-extrabold font-mono tracking-wider text-white drop-shadow-md">
                        ${this.formatTime(this.timerSeconds)}
                      </div>
                      <div class="text-[10px] text-emerald-200 font-mono mt-1">Live Stopwatch Elapsed</div>
                    </div>

                    <div class="flex items-center justify-center gap-3 pt-2">
                      <button id="timer-toggle-btn" class="w-11 h-11 rounded-full bg-white text-slate-950 flex items-center justify-center text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all" title="Pause/Play Timer">
                        ${this.isTimerRunning ? '❚❚' : '▶'}
                      </button>
                      <button id="timer-reset-btn" class="w-11 h-11 rounded-full bg-[#ef4444] text-white flex items-center justify-center text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all" title="Reset Timer">
                        ■
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BOARD THEMES SECTION -->
              <div class="bento-card p-5" id="theme-section">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-bold text-white tracking-tight">Board Theme Surface</span>
                  <span class="text-xs text-emerald-400 font-mono">Custom Visual Surfaces</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  ${[
                    { id: 'obsidian', name: 'Obsidian Glass', icon: '🔮' },
                    { id: 'neon', name: 'Cyber Neon', icon: '⚡' },
                    { id: 'royal', name: 'Royal Sapphire', icon: '💎' },
                    { id: 'classic', name: 'Classic Luxe', icon: '🪵' },
                  ]
                    .map(
                      (th) => `
                    <button data-theme="${th.id}" class="theme-select-btn p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                        this.selectedTheme === th.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/60'
                          : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                      }">
                      <span class="text-xl">${th.icon}</span>
                      <div>
                        <div class="text-xs font-bold">${th.name}</div>
                        <div class="text-[10px] ${this.selectedTheme === th.id ? 'text-emerald-400' : 'text-slate-500'} font-mono">Surface</div>
                      </div>
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- OFFICIAL RULES ACCORDION -->
              <div class="bento-card p-5" id="rules-section">
                <div class="flex items-center justify-between cursor-pointer" id="rules-toggle-header">
                  <div class="flex items-center gap-2 text-xs font-bold text-white">
                    <span>📖</span>
                    <span>Official Rules and Gameplay Guide</span>
                  </div>
                  <span id="rules-toggle-icon" class="text-xs text-emerald-400 font-bold">▼</span>
                </div>

                <div id="rules-content" class="hidden mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
                  <div class="p-3 bg-white/[0.03] rounded-2xl border border-white/10">
                    <strong class="text-white block mb-1">1. Entering Board</strong>
                    Roll a 6 to move any token from your home yard to the starting tile.
                  </div>
                  <div class="p-3 bg-white/[0.03] rounded-2xl border border-white/10">
                    <strong class="text-white block mb-1">2. Safe Star Tiles</strong>
                    Tiles marked with purple stars (★) are safe zones where tokens cannot be captured.
                  </div>
                  <div class="p-3 bg-white/[0.03] rounded-2xl border border-white/10">
                    <strong class="text-white block mb-1">3. Knockouts & Extra Rolls</strong>
                    Landing on an opponent sends them back to their yard and awards an extra roll!
                  </div>
                  <div class="p-3 bg-white/[0.03] rounded-2xl border border-white/10">
                    <strong class="text-white block mb-1">4. 3 Consecutive Sixes</strong>
                    Rolling three 6s in a row passes your turn immediately to prevent runaway turns.
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Start Meeting / Quick launch button
    document.getElementById('btn-start-meeting')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    // Hero Add Project / Host Room
    document.getElementById('btn-hero-host-room')?.addEventListener('click', () => {
      if (this.onHostRoomCallback) this.onHostRoomCallback('Host (You)');
    });

    // Hero Import Data / Join Room
    document.getElementById('btn-hero-join-room')?.addEventListener('click', () => {
      const input = document.getElementById('input-top-room-code') as HTMLInputElement;
      const code = input ? input.value.trim().toUpperCase() : '';
      if (code.length === 6) {
        if (this.onJoinRoomCallback) this.onJoinRoomCallback(code, 'Guest');
      } else {
        const promptCode = prompt('Enter 6-character room code:');
        if (promptCode && promptCode.trim().length === 6) {
          if (this.onJoinRoomCallback) this.onJoinRoomCallback(promptCode.trim().toUpperCase(), 'Guest');
        }
      }
    });

    // Top search bar Enter key press
    document.getElementById('input-top-room-code')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = e.currentTarget as HTMLInputElement;
        const code = input.value.trim().toUpperCase();
        if (code.length === 6) {
          if (this.onJoinRoomCallback) this.onJoinRoomCallback(code, 'Guest');
        }
      }
    });

    // Project Task rows click to launch game modes
    document.querySelectorAll('.project-task-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        const task = (e.currentTarget as HTMLElement).dataset.task;
        if (task === 'api' || task === 'testing') {
          const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
          if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
        } else if (task === 'onboarding' || task === 'optimize') {
          const config = this.buildMatchConfig('pass_and_play', 4);
          if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
        } else if (task === 'dashboard') {
          if (this.onHostRoomCallback) this.onHostRoomCallback('Host (You)');
        }
      });
    });

    // KPI cards click to launch game modes
    document.getElementById('kpi-card-1')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    document.getElementById('kpi-card-2')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('pass_and_play', 4);
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    document.getElementById('kpi-card-3')?.addEventListener('click', () => {
      if (this.onHostRoomCallback) this.onHostRoomCallback('Host (You)');
    });

    // Sidebar download button
    document.getElementById('btn-sidebar-download')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    // Theme selector buttons
    document.querySelectorAll('.theme-select-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const theme = (e.currentTarget as HTMLElement).dataset.theme as BoardTheme;
        this.selectedTheme = theme;
        document.querySelectorAll('.theme-select-btn').forEach((b) => {
          const isSelected = (b as HTMLElement).dataset.theme === theme;
          b.className = `theme-select-btn p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
            isSelected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/60'
              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
          }`;
        });
        if (this.onThemeChangeCallback) this.onThemeChangeCallback(theme);
      });
    });

    // Timer controls
    document.getElementById('timer-toggle-btn')?.addEventListener('click', (e) => {
      this.isTimerRunning = !this.isTimerRunning;
      (e.currentTarget as HTMLElement).textContent = this.isTimerRunning ? '❚❚' : '▶';
    });

    document.getElementById('timer-reset-btn')?.addEventListener('click', () => {
      this.timerSeconds = 0;
      const el = document.getElementById('time-tracker-clock');
      if (el) el.textContent = '00:00:00';
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

    document.getElementById('nav-rules-btn')?.addEventListener('click', () => {
      if (rulesContent && rulesIcon) {
        rulesContent.classList.remove('hidden');
        rulesIcon.textContent = '▲';
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


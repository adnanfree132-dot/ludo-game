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
  private timerSeconds: number = 5048; // 01:24:08 initial sample
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

    const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 41;
    const matchesCount = stats.matchesPlayed > 0 ? stats.matchesPlayed : 24;
    const wonCount = stats.matchesWon > 0 ? stats.matchesWon : 10;
    const capturesCount = stats.tokensCaptured > 0 ? stats.tokensCaptured : 12;
    const homeCount = stats.tokensHome > 0 ? stats.tokensHome : 2;

    this.containerEl.innerHTML = `
      <div class="dashboard-layout-wrapper flex flex-col md:flex-row min-h-[100dvh] w-full">
        <!-- LEFT SIDEBAR -->
        <aside class="w-full md:w-64 bg-white border-r border-gray-200/80 p-5 flex flex-col justify-between shrink-0">
          <div class="flex flex-col gap-6">
            <!-- Brand Logo -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-white shadow-sm border-2 border-emerald-600/30 font-black text-base">
                  🎲
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-xl font-extrabold text-gray-900 tracking-tight">Donezo</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
              <span class="md:hidden text-xs text-gray-400 font-mono">MENU</span>
            </div>

            <!-- Nav Groups -->
            <div class="flex flex-col gap-5">
              <!-- MENU -->
              <div>
                <div class="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-2">Menu</div>
                <nav class="flex flex-col gap-1">
                  <a href="#" class="sidebar-nav-item active">
                    <span class="text-base">📊</span>
                    <span>Dashboard</span>
                  </a>
                  <a href="#modes-section" class="sidebar-nav-item">
                    <span class="text-base">🎮</span>
                    <span>Game Modes</span>
                    <span class="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">3</span>
                  </a>
                  <a href="#analytics-section" class="sidebar-nav-item">
                    <span class="text-base">📈</span>
                    <span>Analytics</span>
                  </a>
                  <a href="#stats-section" class="sidebar-nav-item">
                    <span class="text-base">🏆</span>
                    <span>Career Stats</span>
                    <span class="ml-auto text-[10px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded-full">12+</span>
                  </a>
                  <a href="#squad-section" class="sidebar-nav-item">
                    <span class="text-base">👥</span>
                    <span>Opponents</span>
                  </a>
                </nav>
              </div>

              <!-- GENERAL -->
              <div>
                <div class="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-2">General</div>
                <nav class="flex flex-col gap-1">
                  <a href="#theme-section" class="sidebar-nav-item">
                    <span class="text-base">🎨</span>
                    <span>Board Themes</span>
                  </a>
                  <a href="#rules-section" class="sidebar-nav-item" id="nav-rules-btn">
                    <span class="text-base">📖</span>
                    <span>Help & Rules</span>
                  </a>
                  <a href="#" class="sidebar-nav-item" id="nav-pwa-btn">
                    <span class="text-base">📱</span>
                    <span>Mobile PWA</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <!-- Bottom Left Promo Card -->
          <div class="wavy-time-card p-4 rounded-2xl mt-6 hidden md:flex flex-col justify-between gap-3 relative overflow-hidden">
            <div class="flex items-center gap-2">
              <span class="text-base">📱</span>
              <span class="text-xs font-bold text-emerald-200 uppercase tracking-wider">Web App</span>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white leading-tight">Play on Mobile Device</h4>
              <p class="text-[11px] text-emerald-200/80 mt-0.5">Responsive real-time P2P</p>
            </div>
            <button id="btn-sidebar-quick-play" class="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-all shadow-md active:scale-95">
              Launch Now
            </button>
          </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-1 flex flex-col min-w-0 bg-[#f4f5f7]">
          <!-- TOP HEADER BAR -->
          <header class="w-full bg-white border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
            <!-- Search & Room Code Input -->
            <div class="flex-1 max-w-md relative">
              <div class="flex items-center bg-gray-100/90 border border-gray-200 rounded-full px-3.5 py-2 text-xs text-gray-800 gap-2 focus-within:border-emerald-600 focus-within:bg-white transition-all shadow-inner">
                <span class="text-gray-400 text-sm">🔍</span>
                <input id="input-top-room-code" type="text" maxlength="6" placeholder="Search room code or enter code..." class="bg-transparent outline-none w-full text-xs font-medium placeholder:text-gray-400 uppercase" />
                <span class="hidden sm:inline text-[10px] font-mono font-bold bg-white text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">Ctrl+K</span>
              </div>
            </div>

            <!-- Profile & Header Actions -->
            <div class="flex items-center gap-3">
              <button id="btn-quick-join-header" class="hidden sm:flex px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs border border-gray-200 transition-all">
                Join
              </button>

              <div class="flex items-center gap-2.5 pl-2 border-l border-gray-200">
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 p-[1.5px] shadow-sm">
                  <div class="w-full h-full rounded-full bg-emerald-900 flex items-center justify-center text-sm font-bold text-white">
                    👑
                  </div>
                </div>
                <div class="hidden sm:block text-left">
                  <div class="text-xs font-bold text-gray-900 leading-none">Champion</div>
                  <div class="text-[10px] text-gray-500 font-mono mt-0.5">${winRate}% Win Rate</div>
                </div>
              </div>
            </div>
          </header>

          <!-- DASHBOARD BODY CONTAINER -->
          <div class="p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <!-- PAGE TITLE & HERO ACTIONS -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Dashboard</h1>
                <p class="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Plan, roll, and conquer the board with ease.</p>
              </div>

              <div class="flex items-center gap-2.5 w-full sm:w-auto">
                <button id="btn-hero-host-room" class="bento-btn-primary flex-1 sm:flex-none">
                  <span class="text-base leading-none">+</span>
                  <span>Host Room</span>
                </button>
                <button id="btn-hero-join-room" class="bento-btn-outline flex-1 sm:flex-none">
                  <span>🌐</span>
                  <span>Join Match</span>
                </button>
              </div>
            </div>

            <!-- ROW 1: 4 TOP KPI METRIC CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-section">
              <!-- Card 1: Emerald Hero Card (Total Projects / Matches) -->
              <div class="bento-emerald-card p-5 flex flex-col justify-between gap-3 relative overflow-hidden">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-200">Total Matches</span>
                  <div class="arrow-circle-btn-white">↗</div>
                </div>
                <div>
                  <div class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">${matchesCount}</div>
                  <div class="mt-2 flex items-center gap-1.5 text-xs text-emerald-200/90 font-medium">
                    <span class="px-1.5 py-0.5 rounded bg-emerald-600/50 text-white font-mono text-[10px] font-bold">5+</span>
                    <span>Increased from last session</span>
                  </div>
                </div>
              </div>

              <!-- Card 2: Ended Projects / Victories Won -->
              <div class="bento-card p-5 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-600">Ended Matches</span>
                  <div class="arrow-circle-btn">↗</div>
                </div>
                <div>
                  <div class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-mono">${wonCount}</div>
                  <div class="mt-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px] font-bold">🏆 ${winRate}%</span>
                    <span>Win Rate Overall</span>
                  </div>
                </div>
              </div>

              <!-- Card 3: Running Projects / Captures -->
              <div class="bento-card p-5 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-600">Total Captures</span>
                  <div class="arrow-circle-btn">↗</div>
                </div>
                <div>
                  <div class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-mono">${capturesCount}</div>
                  <div class="mt-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px] font-bold">⚡ ${stats.bestStreak || 4}</span>
                    <span>Best Win Streak</span>
                  </div>
                </div>
              </div>

              <!-- Card 4: Pending Project / Tokens Home -->
              <div class="bento-card p-5 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-600">Tokens Home</span>
                  <div class="arrow-circle-btn">↗</div>
                </div>
                <div>
                  <div class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-mono">${homeCount}</div>
                  <div class="mt-2 text-xs text-gray-500 font-medium">
                    <span>On Conquest Track</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 2: MIDDLE BENTO ROW (Analytics, Reminders, Project Modes) -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4" id="analytics-section">
              <!-- Pill Bar Chart: Project / Match Analytics (5 cols) -->
              <div class="bento-card p-5 md:col-span-4 flex flex-col justify-between gap-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-900 tracking-tight">Project Analytics</span>
                  <span class="text-[11px] text-gray-400 font-mono">Weekly</span>
                </div>

                <!-- Vertical Pill Bars Display -->
                <div class="flex items-end justify-between h-40 pt-4 px-2">
                  <!-- Sunday -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-20 rounded-full pill-bar-striped"></div>
                    <span class="text-[11px] font-bold text-gray-400 font-mono">S</span>
                  </div>
                  <!-- Monday -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-28 rounded-full pill-bar-solid-dark"></div>
                    <span class="text-[11px] font-bold text-gray-400 font-mono">M</span>
                  </div>
                  <!-- Tuesday (With Floating 74% Tooltip) -->
                  <div class="flex flex-col items-center gap-2 relative">
                    <div class="absolute -top-7 px-1.5 py-0.5 rounded-md bg-gray-900 text-white font-mono text-[9px] font-bold shadow-md">74%</div>
                    <div class="w-6 h-24 rounded-full pill-bar-solid-mint"></div>
                    <span class="text-[11px] font-bold text-gray-900 font-mono">T</span>
                  </div>
                  <!-- Wednesday -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-32 rounded-full pill-bar-solid-dark"></div>
                    <span class="text-[11px] font-bold text-gray-400 font-mono">W</span>
                  </div>
                  <!-- Thursday -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-16 rounded-full pill-bar-striped"></div>
                    <span class="text-[11px] font-bold text-gray-400 font-mono">T</span>
                  </div>
                  <!-- Friday -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-24 rounded-full pill-bar-striped"></div>
                    <span class="text-[11px] font-bold text-gray-400 font-mono">F</span>
                  </div>
                  <!-- Saturday -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-20 rounded-full pill-bar-striped"></div>
                    <span class="text-[11px] font-bold text-gray-400 font-mono">S</span>
                  </div>
                </div>
              </div>

              <!-- Quick Launch Card: Reminders Style (4 cols) -->
              <div class="bento-card p-5 md:col-span-4 flex flex-col justify-between gap-4">
                <div>
                  <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Action</div>
                  <h3 class="text-lg font-bold text-gray-900 mt-2">Solo Match with Smart AI</h3>
                  <p class="text-xs text-gray-500 mt-1">Adaptive Bot Intelligence • 4 Players</p>
                </div>

                <div class="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
                  <span class="text-xl">🤖</span>
                  <div class="text-xs">
                    <span class="font-bold text-gray-800">Master Level Bots</span>
                    <p class="text-[11px] text-gray-500 font-mono">Safe-zone & capture heuristics</p>
                  </div>
                </div>

                <button id="btn-quick-start-match" class="bento-btn-primary w-full py-3">
                  <span>📹</span>
                  <span>Start Match</span>
                </button>
              </div>

              <!-- Game Modes Selection Card (4 cols) -->
              <div class="bento-card p-5 md:col-span-4 flex flex-col justify-between gap-3" id="modes-section">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-900 tracking-tight">Game Modes</span>
                  <span class="text-[10px] font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md">+ Select</span>
                </div>

                <div class="space-y-2 text-xs">
                  <!-- Mode 1: Solo AI -->
                  <div class="p-2.5 rounded-xl border border-gray-200 hover:border-emerald-600 bg-gray-50/50 flex items-center justify-between cursor-pointer mode-picker-item" data-mode="vs_ai">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">🤖</span>
                      <div>
                        <div class="font-bold text-gray-900">Solo vs Smart AI</div>
                        <div class="text-[10px] text-gray-500">2 - 4 Players with bots</div>
                      </div>
                    </div>
                    <button class="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-bold text-[11px]">Play</button>
                  </div>

                  <!-- Mode 2: Pass and Play -->
                  <div class="p-2.5 rounded-xl border border-gray-200 hover:border-emerald-600 bg-gray-50/50 flex items-center justify-between cursor-pointer mode-picker-item" data-mode="pass_and_play">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">👥</span>
                      <div>
                        <div class="font-bold text-gray-900">Pass and Play</div>
                        <div class="text-[10px] text-gray-500">Local multiplayer on screen</div>
                      </div>
                    </div>
                    <button class="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-bold text-[11px]">Play</button>
                  </div>

                  <!-- Mode 3: Online P2P -->
                  <div class="p-2.5 rounded-xl border border-gray-200 hover:border-emerald-600 bg-gray-50/50 flex items-center justify-between cursor-pointer mode-picker-item" data-mode="online_room">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">🌐</span>
                      <div>
                        <div class="font-bold text-gray-900">Online P2P Match</div>
                        <div class="text-[10px] text-gray-500">Real players only • Zero lag</div>
                      </div>
                    </div>
                    <button class="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-bold text-[11px]">Host</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 3: BOTTOM BENTO ROW (Team Collaboration, Project Progress, Time Tracker) -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4" id="squad-section">
              <!-- Team / Opponent Collaboration Card (5 cols) -->
              <div class="bento-card p-5 md:col-span-5 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-900 tracking-tight">Active Squad & Bots</span>
                  <span class="text-[10px] font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md">+ Add Bot</span>
                </div>

                <div class="space-y-2.5 text-xs">
                  <!-- Player 1 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold text-xs">🔴</div>
                      <div>
                        <div class="font-bold text-gray-900 text-xs">Crimson Champion</div>
                        <div class="text-[10px] text-gray-400 font-mono">Working on Base Defense</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Completed</span>
                  </div>

                  <!-- Player 2 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs">🟢</div>
                      <div>
                        <div class="font-bold text-gray-900 text-xs">Emerald Bot</div>
                        <div class="text-[10px] text-gray-400 font-mono">Intercepting Safe Tiles</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">In Progress</span>
                  </div>

                  <!-- Player 3 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs">🟡</div>
                      <div>
                        <div class="font-bold text-gray-900 text-xs">Golden Striker</div>
                        <div class="text-[10px] text-gray-400 font-mono">Collecting Bonus Rolls</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Pending</span>
                  </div>

                  <!-- Player 4 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xs">🔵</div>
                      <div>
                        <div class="font-bold text-gray-900 text-xs">Royal Guest</div>
                        <div class="text-[10px] text-gray-400 font-mono">Realtime Peer Connection</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">In Progress</span>
                  </div>
                </div>
              </div>

              <!-- Project Progress Semi-Circle Donut Card (4 cols) -->
              <div class="bento-card p-5 md:col-span-4 flex flex-col justify-between gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-900 tracking-tight">Project Progress</span>
                  <span class="text-[11px] text-gray-400 font-mono">Overall</span>
                </div>

                <!-- Semi-Circle Gauge SVG -->
                <div class="flex flex-col items-center justify-center my-auto">
                  <div class="relative w-36 h-20 flex items-end justify-center overflow-hidden">
                    <svg viewBox="0 0 100 55" class="w-36 h-20">
                      <!-- Background Track -->
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" stroke-width="12" stroke-linecap="round" />
                      <!-- Completed Segment (Deep Emerald) -->
                      <path d="M 10 50 A 40 40 0 0 1 60 12" fill="none" stroke="#064e3b" stroke-width="12" stroke-linecap="round" />
                      <!-- In Progress Segment (Mint) -->
                      <path d="M 60 12 A 40 40 0 0 1 78 26" fill="none" stroke="#34d399" stroke-width="12" stroke-linecap="round" />
                      <!-- Pending Segment (Gray Striped) -->
                      <path d="M 78 26 A 40 40 0 0 1 90 50" fill="none" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="text-center mt-2">
                    <div class="text-2xl font-black text-gray-900 font-mono leading-none">${winRate}%</div>
                    <div class="text-[11px] text-gray-400 font-medium mt-0.5">Project Ended</div>
                  </div>
                </div>

                <!-- Legend -->
                <div class="flex items-center justify-center gap-3 pt-2 border-t border-gray-100 text-[10px] text-gray-600 font-medium">
                  <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#064e3b]"></span> Completed</span>
                  <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#34d399]"></span> In Progress</span>
                  <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#cbd5e1]"></span> Pending</span>
                </div>
              </div>

              <!-- Time Tracker Card with Wavy Texture (3 cols) -->
              <div class="wavy-time-card p-5 md:col-span-3 flex flex-col justify-between gap-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white uppercase tracking-wider">Time Tracker</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>

                <div class="my-auto text-center">
                  <div id="time-tracker-clock" class="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-white drop-shadow-md">
                    ${this.formatTime(this.timerSeconds)}
                  </div>
                  <div class="text-[10px] text-emerald-200/80 font-mono mt-1">Live Turn Elapsed Time</div>
                </div>

                <div class="flex items-center justify-center gap-3 pt-2">
                  <button id="timer-toggle-btn" class="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center text-sm font-black shadow-md hover:scale-105 active:scale-95 transition-all" title="Pause/Play Timer">
                    ${this.isTimerRunning ? '⏸' : '▶'}
                  </button>
                  <button id="timer-reset-btn" class="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-black shadow-md hover:scale-105 active:scale-95 transition-all" title="Reset Timer">
                    ⏹
                  </button>
                </div>
              </div>
            </div>

            <!-- BOARD THEMES SECTION -->
            <div class="bento-card p-5" id="theme-section">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gray-900 tracking-tight">Board Theme Collection</span>
                <span class="text-[11px] text-gray-500 font-mono">Custom Visual Surfaces</span>
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
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                    }">
                    <span class="text-xl">${th.icon}</span>
                    <div>
                      <div class="text-xs font-bold">${th.name}</div>
                      <div class="text-[10px] ${this.selectedTheme === th.id ? 'text-emerald-200' : 'text-gray-400'} font-mono">Surface</div>
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
                <div class="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <span>📖</span>
                  <span>Official Rules and Gameplay Guide</span>
                </div>
                <span id="rules-toggle-icon" class="text-xs text-gray-400 font-bold">▼</span>
              </div>

              <div id="rules-content" class="hidden mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                <div class="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <strong class="text-gray-900 block mb-1">1. Entering Board</strong>
                  Roll a 6 to move any token from your home yard to the starting tile.
                </div>
                <div class="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <strong class="text-gray-900 block mb-1">2. Safe Star Tiles</strong>
                  Tiles marked with purple stars (★) are safe zones where tokens cannot be captured.
                </div>
                <div class="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <strong class="text-gray-900 block mb-1">3. Knockouts & Extra Rolls</strong>
                  Landing on an opponent sends them back to their yard and awards an extra roll!
                </div>
                <div class="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <strong class="text-gray-900 block mb-1">4. 3 Consecutive Sixes</strong>
                  Rolling three 6s in a row passes your turn immediately to prevent runaway turns.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Quick match launcher button
    document.getElementById('btn-quick-start-match')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    // Sidebar quick play button
    document.getElementById('btn-sidebar-quick-play')?.addEventListener('click', () => {
      const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
      if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
    });

    // Hero Host Room button
    document.getElementById('btn-hero-host-room')?.addEventListener('click', () => {
      if (this.onHostRoomCallback) this.onHostRoomCallback('Host (You)');
    });

    // Hero Join Room button
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

    // Header Quick Join button
    document.getElementById('btn-quick-join-header')?.addEventListener('click', () => {
      const input = document.getElementById('input-top-room-code') as HTMLInputElement;
      const code = input ? input.value.trim().toUpperCase() : '';
      if (code.length === 6) {
        if (this.onJoinRoomCallback) this.onJoinRoomCallback(code, 'Guest');
      } else {
        alert('Please enter a valid 6-character room code in the search box.');
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

    // Mode picker items
    document.querySelectorAll('.mode-picker-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).dataset.mode as GameMode;
        if (mode === 'vs_ai') {
          const config = this.buildMatchConfig('vs_ai', 4, 'strategic');
          if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
        } else if (mode === 'pass_and_play') {
          const config = this.buildMatchConfig('pass_and_play', 4);
          if (this.onLaunchGameCallback) this.onLaunchGameCallback(config);
        } else if (mode === 'online_room') {
          if (this.onHostRoomCallback) this.onHostRoomCallback('Host (You)');
        }
      });
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
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
          }`;
        });
        if (this.onThemeChangeCallback) this.onThemeChangeCallback(theme);
      });
    });

    // Timer controls
    document.getElementById('timer-toggle-btn')?.addEventListener('click', (e) => {
      this.isTimerRunning = !this.isTimerRunning;
      (e.currentTarget as HTMLElement).textContent = this.isTimerRunning ? '⏸' : '▶';
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

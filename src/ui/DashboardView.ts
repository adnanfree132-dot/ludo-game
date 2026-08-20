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
  private timerSeconds: number = 5048; // 01:24:08 initial sample from image
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

    const matchesCount = stats.matchesPlayed > 0 ? stats.matchesPlayed : 24;
    const wonCount = stats.matchesWon > 0 ? stats.matchesWon : 10;
    const capturesCount = stats.tokensCaptured > 0 ? stats.tokensCaptured : 12;
    const homeCount = stats.tokensHome > 0 ? stats.tokensHome : 2;

    this.containerEl.innerHTML = `
      <div class="dashboard-layout-wrapper flex flex-col md:flex-row min-h-[100dvh] w-full font-['Plus_Jakarta_Sans'] bg-[#f8fafc]">
        <!-- LEFT SIDEBAR -->
        <aside class="w-full md:w-60 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between shrink-0">
          <div class="flex flex-col gap-8">
            <!-- Brand Logo -->
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                <span class="w-3.5 h-3.5 rounded-full bg-emerald-600"></span>
              </div>
              <span class="text-xl font-extrabold text-slate-900 tracking-tight">Donezo</span>
            </div>

            <!-- Nav Groups -->
            <div class="flex flex-col gap-6">
              <!-- MENU -->
              <div>
                <div class="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-1">Menu</div>
                <nav class="flex flex-col gap-1">
                  <a href="#" class="sidebar-nav-item active">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-900">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
                    </span>
                    <span>Dashboard</span>
                  </a>
                  <a href="#projects-section" class="sidebar-nav-item">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    </span>
                    <span>Tasks</span>
                    <span class="ml-auto text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">12+</span>
                  </a>
                  <a href="#analytics-section" class="sidebar-nav-item">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </span>
                    <span>Calendar</span>
                  </a>
                  <a href="#analytics-section" class="sidebar-nav-item">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    </span>
                    <span>Analytics</span>
                  </a>
                  <a href="#team-section" class="sidebar-nav-item">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </span>
                    <span>Team</span>
                  </a>
                </nav>
              </div>

              <!-- GENERAL -->
              <div>
                <div class="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-1">General</div>
                <nav class="flex flex-col gap-1">
                  <a href="#theme-section" class="sidebar-nav-item">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </span>
                    <span>Settings</span>
                  </a>
                  <a href="#rules-section" class="sidebar-nav-item" id="nav-rules-btn">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </span>
                    <span>Help</span>
                  </a>
                  <a href="#" class="sidebar-nav-item">
                    <span class="w-5 h-5 flex items-center justify-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </span>
                    <span>Logout</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <!-- Bottom Left Promo Card -->
          <div class="wavy-time-card p-5 rounded-2xl mt-8 hidden md:flex flex-col justify-between gap-3 relative overflow-hidden">
            <div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
              📱
            </div>
            <div>
              <h4 class="text-sm font-bold text-white leading-tight">Download our Mobile App</h4>
              <p class="text-[11px] text-emerald-200/80 mt-1">Get easy in another way</p>
            </div>
            <button id="btn-sidebar-download" class="w-full py-2 rounded-xl bg-[#0f392b] border border-white/20 hover:bg-[#165b45] text-white font-bold text-xs transition-all active:scale-95">
              Download
            </button>
          </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
          <!-- TOP HEADER BAR -->
          <header class="w-full bg-white border-b border-slate-200/80 px-6 sm:px-10 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
            <!-- Search Input -->
            <div class="flex-1 max-w-md relative">
              <div class="flex items-center bg-[#f8fafc] border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 gap-2.5 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                <span class="text-slate-400 text-sm">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input id="input-top-room-code" type="text" maxlength="6" placeholder="Search task or enter room code..." class="bg-transparent outline-none w-full text-xs font-medium placeholder:text-slate-400" />
                <span class="hidden sm:inline text-[10px] font-mono font-bold bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Ctrl+K</span>
              </div>
            </div>

            <!-- Profile & Header Actions -->
            <div class="flex items-center gap-4">
              <!-- Bell Icon -->
              <button class="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </button>

              <!-- Profile Pill -->
              <div class="flex items-center gap-2.5 pl-2">
                <div class="w-8 h-8 rounded-full bg-[#fde047] flex items-center justify-center text-sm shadow-sm overflow-hidden">
                  👨‍💼
                </div>
                <div class="hidden sm:block text-left text-xs font-semibold text-slate-700">
                  tmichael20@gmail.com
                </div>
              </div>
            </div>
          </header>

          <!-- DASHBOARD BODY CONTAINER -->
          <div class="p-6 sm:p-10 flex flex-col gap-7 max-w-[1400px] mx-auto w-full">
            <!-- PAGE TITLE & HERO ACTIONS -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
              </div>

              <div class="flex items-center gap-3 w-full sm:w-auto">
                <button id="btn-hero-host-room" class="bento-btn-primary flex-1 sm:flex-none">
                  <span class="text-base leading-none font-bold">+</span>
                  <span>Add Project</span>
                </button>
                <button id="btn-hero-join-room" class="bento-btn-outline flex-1 sm:flex-none">
                  <span>Import Data</span>
                </button>
              </div>
            </div>

            <!-- ROW 1: 4 TOP KPI METRIC CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-section">
              <!-- Card 1: Total Projects (Deep Emerald Hero Card) -->
              <div class="bento-emerald-card p-6 flex flex-col justify-between gap-4 relative overflow-hidden cursor-pointer" id="kpi-card-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-white/90">Total Projects</span>
                  <div class="arrow-circle-btn-white">↗</div>
                </div>
                <div>
                  <div class="text-4xl font-extrabold text-white tracking-tight font-mono">${matchesCount}</div>
                  <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                    <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">5+</span>
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>

              <!-- Card 2: Ended Projects -->
              <div class="bento-card p-6 flex flex-col justify-between gap-4 cursor-pointer" id="kpi-card-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-700">Ended Projects</span>
                  <div class="arrow-circle-btn">↗</div>
                </div>
                <div>
                  <div class="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">${wonCount}</div>
                  <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">6+</span>
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>

              <!-- Card 3: Running Projects -->
              <div class="bento-card p-6 flex flex-col justify-between gap-4 cursor-pointer" id="kpi-card-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-700">Running Projects</span>
                  <div class="arrow-circle-btn">↗</div>
                </div>
                <div>
                  <div class="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">${capturesCount}</div>
                  <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">2+</span>
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>

              <!-- Card 4: Pending Project -->
              <div class="bento-card p-6 flex flex-col justify-between gap-4 cursor-pointer" id="kpi-card-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-700">Pending Project</span>
                  <div class="arrow-circle-btn">↗</div>
                </div>
                <div>
                  <div class="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">${homeCount}</div>
                  <div class="mt-3 text-xs text-slate-500 font-medium">
                    <span>On Discuss</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 2: MIDDLE BENTO ROW (Project Analytics, Reminders, Project Tasks) -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5" id="analytics-section">
              <!-- Card A: Project Analytics (Pill Bar Chart) (5 cols) -->
              <div class="bento-card p-6 md:col-span-4 flex flex-col justify-between gap-4">
                <div class="text-sm font-bold text-slate-900 tracking-tight">Project Analytics</div>

                <!-- Pill Bar Chart for days S M T W T F S -->
                <div class="flex items-end justify-between h-44 pt-6 px-1">
                  <!-- Sunday -->
                  <div class="flex flex-col items-center gap-2.5">
                    <div class="w-9 h-24 rounded-full pill-bar-striped"></div>
                    <span class="text-xs font-semibold text-slate-400">S</span>
                  </div>
                  <!-- Monday -->
                  <div class="flex flex-col items-center gap-2.5">
                    <div class="w-9 h-32 rounded-full pill-bar-solid-dark"></div>
                    <span class="text-xs font-semibold text-slate-400">M</span>
                  </div>
                  <!-- Tuesday (with 74% Tooltip) -->
                  <div class="flex flex-col items-center gap-2.5 relative">
                    <div class="absolute -top-7 px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold shadow-md">74%</div>
                    <div class="w-9 h-28 rounded-full pill-bar-solid-mint"></div>
                    <span class="text-xs font-bold text-slate-900">T</span>
                  </div>
                  <!-- Wednesday -->
                  <div class="flex flex-col items-center gap-2.5">
                    <div class="w-9 h-36 rounded-full pill-bar-solid-dark"></div>
                    <span class="text-xs font-semibold text-slate-400">W</span>
                  </div>
                  <!-- Thursday -->
                  <div class="flex flex-col items-center gap-2.5">
                    <div class="w-9 h-20 rounded-full pill-bar-striped"></div>
                    <span class="text-xs font-semibold text-slate-400">T</span>
                  </div>
                  <!-- Friday -->
                  <div class="flex flex-col items-center gap-2.5">
                    <div class="w-9 h-28 rounded-full pill-bar-striped"></div>
                    <span class="text-xs font-semibold text-slate-400">F</span>
                  </div>
                  <!-- Saturday -->
                  <div class="flex flex-col items-center gap-2.5">
                    <div class="w-9 h-24 rounded-full pill-bar-striped"></div>
                    <span class="text-xs font-semibold text-slate-400">S</span>
                  </div>
                </div>
              </div>

              <!-- Card B: Reminders (4 cols) -->
              <div class="bento-card p-6 md:col-span-4 flex flex-col justify-between gap-4">
                <div>
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders</div>
                  <h3 class="text-lg font-extrabold text-slate-900 mt-2.5 leading-snug">Meeting with Arc Company</h3>
                  <p class="text-xs text-slate-400 mt-1.5 font-medium">Time : 02.00 pm - 04.00 pm</p>
                </div>

                <button id="btn-start-meeting" class="bento-btn-primary w-full py-3.5 mt-auto">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  <span>Start Meeting</span>
                </button>
              </div>

              <!-- Card C: Project Tasks List (4 cols) -->
              <div class="bento-card p-6 md:col-span-4 flex flex-col justify-between gap-3.5" id="projects-section">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-900 tracking-tight">Project</span>
                  <button class="text-xs font-bold text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full hover:bg-slate-50 transition-colors">+ New</button>
                </div>

                <div class="space-y-3 text-xs">
                  <!-- Item 1 -->
                  <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors project-task-row" data-task="api">
                    <span class="text-base text-blue-500">🪄</span>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-slate-800 truncate">Develop API Endpoints</div>
                      <div class="text-[10px] text-slate-400 font-medium">Due date: Nov 26, 2024</div>
                    </div>
                  </div>

                  <!-- Item 2 -->
                  <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors project-task-row" data-task="onboarding">
                    <span class="text-base text-emerald-500">🟢</span>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-slate-800 truncate">Onboarding Flow</div>
                      <div class="text-[10px] text-slate-400 font-medium">Due date: Nov 28, 2024</div>
                    </div>
                  </div>

                  <!-- Item 3 -->
                  <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors project-task-row" data-task="dashboard">
                    <span class="text-base text-amber-500">✨</span>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-slate-800 truncate">Build Dashboard</div>
                      <div class="text-[10px] text-slate-400 font-medium">Due date: Nov 30, 2024</div>
                    </div>
                  </div>

                  <!-- Item 4 -->
                  <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors project-task-row" data-task="optimize">
                    <span class="text-base text-orange-500">⚡</span>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-slate-800 truncate">Optimize Page Load</div>
                      <div class="text-[10px] text-slate-400 font-medium">Due date: Dec 5, 2024</div>
                    </div>
                  </div>

                  <!-- Item 5 -->
                  <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors project-task-row" data-task="testing">
                    <span class="text-base text-purple-500">🎯</span>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-slate-800 truncate">Cross-Browser Testing</div>
                      <div class="text-[10px] text-slate-400 font-medium">Due date: Dec 6, 2024</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ROW 3: BOTTOM BENTO ROW (Team Collaboration, Project Progress, Time Tracker) -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5" id="team-section">
              <!-- Team Collaboration (5 cols) -->
              <div class="bento-card p-6 md:col-span-5 flex flex-col justify-between gap-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-900 tracking-tight">Team Collaboration</span>
                  <button class="text-xs font-bold text-slate-600 border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors">+ Add Member</button>
                </div>

                <div class="space-y-3.5 text-xs">
                  <!-- Member 1 -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm shrink-0">👩‍💼</div>
                      <div class="truncate">
                        <div class="font-bold text-slate-900 truncate">Alexandra Deff</div>
                        <div class="text-[10.5px] text-slate-400 truncate">Working on <span class="font-medium text-slate-600">Github Project Repository</span></div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">Completed</span>
                  </div>

                  <!-- Member 2 -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0">👨‍💻</div>
                      <div class="truncate">
                        <div class="font-bold text-slate-900 truncate">Edwin Adenike</div>
                        <div class="text-[10.5px] text-slate-400 truncate">Working on <span class="font-medium text-slate-600">Integrate User Authentication System</span></div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">In Progress</span>
                  </div>

                  <!-- Member 3 -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0">🧑‍🎨</div>
                      <div class="truncate">
                        <div class="font-bold text-slate-900 truncate">Isaac Oluwatemilorun</div>
                        <div class="text-[10.5px] text-slate-400 truncate">Working on <span class="font-medium text-slate-600">Develop Search and Filter Functionality</span></div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 shrink-0">Pending</span>
                  </div>

                  <!-- Member 4 -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm shrink-0">👨‍🚀</div>
                      <div class="truncate">
                        <div class="font-bold text-slate-900 truncate">David Oshodi</div>
                        <div class="text-[10.5px] text-slate-400 truncate">Working on <span class="font-medium text-slate-600">Responsive Layout for Homepage</span></div>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">In Progress</span>
                  </div>
                </div>
              </div>

              <!-- Project Progress (4 cols) -->
              <div class="bento-card p-6 md:col-span-4 flex flex-col justify-between gap-2">
                <div class="text-sm font-bold text-slate-900 tracking-tight">Project Progress</div>

                <!-- Semi-Circle Gauge SVG -->
                <div class="flex flex-col items-center justify-center my-auto pt-2">
                  <div class="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                    <svg viewBox="0 0 100 55" class="w-44 h-24">
                      <!-- Background Track -->
                      <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none" stroke="#f1f5f9" stroke-width="11" stroke-linecap="round" />
                      <!-- Completed Segment (Deep Emerald) -->
                      <path d="M 12 50 A 38 38 0 0 1 58 12" fill="none" stroke="#0f392b" stroke-width="11" stroke-linecap="round" />
                      <!-- In Progress Segment (Mint) -->
                      <path d="M 58 12 A 38 38 0 0 1 76 26" fill="none" stroke="#34d399" stroke-width="11" stroke-linecap="round" />
                      <!-- Pending Segment (Gray Striped) -->
                      <path d="M 76 26 A 38 38 0 0 1 88 50" fill="none" stroke="#cbd5e1" stroke-width="11" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="text-center mt-1">
                    <div class="text-3xl font-extrabold text-slate-900 font-mono leading-none">41%</div>
                    <div class="text-xs text-slate-400 font-medium mt-1">Project Ended</div>
                  </div>
                </div>

                <!-- Legend -->
                <div class="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-600 font-medium">
                  <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#0f392b]"></span> Completed</span>
                  <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#34d399]"></span> In Progress</span>
                  <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></span> Pending</span>
                </div>
              </div>

              <!-- Time Tracker Card with Wavy 3D Texture (3 cols) -->
              <div class="wavy-time-card p-6 md:col-span-3 flex flex-col justify-between gap-4">
                <div class="text-sm font-semibold text-white/90">Time Tracker</div>

                <div class="my-auto text-center py-2">
                  <div id="time-tracker-clock" class="text-4xl font-extrabold font-mono tracking-wider text-white drop-shadow-md">
                    ${this.formatTime(this.timerSeconds)}
                  </div>
                </div>

                <div class="flex items-center justify-center gap-3 pt-2">
                  <button id="timer-toggle-btn" class="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all" title="Pause/Play Timer">
                    ${this.isTimerRunning ? '⏸' : '▶'}
                  </button>
                  <button id="timer-reset-btn" class="w-11 h-11 rounded-full bg-[#dc2626] text-white flex items-center justify-center text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all" title="Reset Timer">
                    ⏹
                  </button>
                </div>
              </div>
            </div>

            <!-- BOARD THEMES SECTION -->
            <div class="bento-card p-6" id="theme-section">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-bold text-slate-900 tracking-tight">Board Theme Surface</span>
                <span class="text-xs text-slate-400 font-mono">Custom Visual Surfaces</span>
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
                        ? 'bg-[#0f392b] text-white border-[#0f392b] shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }">
                    <span class="text-xl">${th.icon}</span>
                    <div>
                      <div class="text-xs font-bold">${th.name}</div>
                      <div class="text-[10px] ${this.selectedTheme === th.id ? 'text-emerald-200' : 'text-slate-400'} font-mono">Surface</div>
                    </div>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- OFFICIAL RULES ACCORDION -->
            <div class="bento-card p-6" id="rules-section">
              <div class="flex items-center justify-between cursor-pointer" id="rules-toggle-header">
                <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span>📖</span>
                  <span>Official Rules and Gameplay Guide</span>
                </div>
                <span id="rules-toggle-icon" class="text-xs text-slate-400 font-bold">▼</span>
              </div>

              <div id="rules-content" class="hidden mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong class="text-slate-900 block mb-1">1. Entering Board</strong>
                  Roll a 6 to move any token from your home yard to the starting tile.
                </div>
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong class="text-slate-900 block mb-1">2. Safe Star Tiles</strong>
                  Tiles marked with purple stars (★) are safe zones where tokens cannot be captured.
                </div>
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong class="text-slate-900 block mb-1">3. Knockouts & Extra Rolls</strong>
                  Landing on an opponent sends them back to their yard and awards an extra roll!
                </div>
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong class="text-slate-900 block mb-1">4. 3 Consecutive Sixes</strong>
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
              ? 'bg-[#0f392b] text-white border-[#0f392b] shadow-md'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
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


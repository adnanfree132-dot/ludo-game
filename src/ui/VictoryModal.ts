import confetti from 'canvas-confetti';
import { GameState, PlayerColor } from '../engine/Types';

const COLOR_MAP: Record<PlayerColor, string> = {
  red: 'Crimson Red',
  green: 'Emerald Green',
  yellow: 'Golden Yellow',
  blue: 'Royal Blue',
};

export class VictoryModal {
  private overlayEl: HTMLElement | null;
  private modalEl: HTMLElement | null;
  private onRematchCallback: (() => void) | null = null;
  private onNewGameCallback: (() => void) | null = null;

  constructor() {
    this.overlayEl = document.getElementById('modal-overlay');
    this.modalEl = document.getElementById('victory-modal');
  }

  public onRematch(cb: () => void): void {
    this.onRematchCallback = cb;
  }

  public onNewGame(cb: () => void): void {
    this.onNewGameCallback = cb;
  }

  public show(state: Readonly<GameState>): void {
    if (!this.overlayEl || !this.modalEl) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // Confetti fallback
    }

    const winner = state.players[state.winnerList[0]];

    this.modalEl.innerHTML = `
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
          🏆
        </div>
        <h2 class="text-2xl font-black text-white tracking-tight mb-1">VICTORY!</h2>
        <p class="text-xs text-zinc-400 mb-6">
          <strong class="text-white">${winner.name}</strong> (${COLOR_MAP[winner.color]}) has conquered the board!
        </p>

        <!-- Podium Rankings Table -->
        <div class="bg-zinc-900/90 rounded-2xl border border-zinc-800/80 p-4 mb-6 text-left">
          <div class="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3 font-semibold flex items-center justify-between">
            <span>Final Standings</span>
            <span class="text-zinc-500 text-[10px]">${state.turnCount} Total Turns</span>
          </div>
          <div class="space-y-2">
            ${state.winnerList
              .map((pIndex, rank) => {
                const p = state.players[pIndex];
                const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🎖️';
                return `
                  <div class="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">${medal}</span>
                      <span class="font-bold text-white">${p.name}</span>
                      <span class="text-[10px] text-zinc-400 font-mono">(${COLOR_MAP[p.color]})</span>
                    </div>
                    <span class="font-mono font-bold text-emerald-400">#${rank + 1}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="modal-rematch-btn" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
            🔄 Rematch
          </button>
          <button id="modal-newgame-btn" class="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 active:scale-95 transition-all">
            🏠 Main Dashboard
          </button>
        </div>
      </div>
    `;

    this.overlayEl.classList.remove('hidden');
    this.modalEl.classList.remove('hidden');

    document.getElementById('modal-rematch-btn')?.addEventListener('click', () => {
      this.hide();
      if (this.onRematchCallback) this.onRematchCallback();
    });

    document.getElementById('modal-newgame-btn')?.addEventListener('click', () => {
      this.hide();
      if (this.onNewGameCallback) this.onNewGameCallback();
    });
  }

  public hide(): void {
    if (this.overlayEl && this.modalEl) {
      this.modalEl.classList.add('hidden');
      this.overlayEl.classList.add('hidden');
    }
  }
}

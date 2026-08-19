import { GameState, PlayerColor } from '../engine/Types';

const COLOR_NAMES: Record<PlayerColor, string> = {
  red: 'Crimson Red',
  green: 'Emerald Green',
  yellow: 'Golden Yellow',
  blue: 'Royal Blue',
};

const COLOR_EMOJIS: Record<PlayerColor, string> = {
  red: '🔴',
  green: '🟢',
  yellow: '🟡',
  blue: '🔵',
};

export class TurnIndicator {
  private bannerAvatarEl: HTMLElement | null;
  private bannerTextEl: HTMLElement | null;
  private mobileStripEl: HTMLElement | null;

  constructor() {
    this.bannerAvatarEl = document.getElementById('turn-banner-avatar');
    this.bannerTextEl = document.getElementById('turn-banner-text');
    this.mobileStripEl = document.getElementById('mobile-players-strip');
  }

  public update(state: Readonly<GameState>): void {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    // Update Desktop Left & Right Sidebars
    this.renderDesktopCards(state);

    // Update Mobile Player Mini Indicators Strip
    this.renderMobileStrip(state);

    // Update Center Turn Banner
    if (this.bannerAvatarEl && this.bannerTextEl) {
      this.bannerAvatarEl.textContent = COLOR_EMOJIS[activePlayer.color];

      if (state.phase === 'game_over') {
        const winner = state.players[state.winnerList[0]];
        this.bannerTextEl.textContent = `Match Finished! Winner: ${winner.name}`;
      } else if (state.dice.consecutiveSixes === 3) {
        this.bannerTextEl.textContent = `3 Consecutive Sixes! Turn Forfeited.`;
      } else if (state.phase === 'selecting_move') {
        if (activePlayer.slotType === 'ai_bot') {
          this.bannerTextEl.textContent = `${activePlayer.name} is choosing a token...`;
        } else {
          this.bannerTextEl.textContent = `Select a glowing token to move ${state.dice.currentValue} steps`;
        }
      } else if (state.phase === 'waiting_roll') {
        this.bannerTextEl.textContent = `${activePlayer.name}'s turn : ${activePlayer.slotType === 'ai_bot' ? 'Rolling...' : 'Roll dice'}`;
      }
    }
  }

  private renderDesktopCards(state: Readonly<GameState>): void {
    state.players.forEach((player) => {
      const cardEl = document.getElementById(`player-card-${player.index}`);
      if (!cardEl) return;

      const isActive = player.index === state.activePlayerIndex;
      const isWinner = player.hasWon;

      cardEl.className = `player-hud-card ${isActive ? `active color-${player.color}` : ''} ${isWinner ? 'opacity-70' : ''}`;
      cardEl.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">${COLOR_EMOJIS[player.color]}</span>
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-1.5">
                <span>${player.name}</span>
                ${
                  player.slotType === 'ai_bot'
                    ? `<span class="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">BOT</span>`
                    : player.slotType === 'remote_player'
                    ? `<span class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">REMOTE</span>`
                    : ''
                }
              </div>
              <div class="text-[10px] text-zinc-400 font-mono">${COLOR_NAMES[player.color]}</div>
            </div>
          </div>
          ${player.finishRank ? `<span class="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">#${player.finishRank}</span>` : ''}
        </div>

        <div class="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-2">
          <div class="flex items-center justify-between bg-zinc-950/60 px-2 py-1 rounded-lg">
            <span>Yard:</span>
            <strong class="text-zinc-200">${player.tokensInBase}/4</strong>
          </div>
          <div class="flex items-center justify-between bg-zinc-950/60 px-2 py-1 rounded-lg">
            <span>Home:</span>
            <strong class="text-emerald-400">${player.tokensFinished}/4</strong>
          </div>
        </div>
      `;
    });
  }

  private renderMobileStrip(state: Readonly<GameState>): void {
    if (!this.mobileStripEl) return;

    this.mobileStripEl.innerHTML = state.players
      .map((p) => {
        const isActive = p.index === state.activePlayerIndex;
        return `
          <div id="mobile-player-${p.index}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur-md transition-all ${
            isActive ? `bg-zinc-800 text-white border border-${p.color}-500 shadow-md` : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800/80'
          }">
            <span>${COLOR_EMOJIS[p.color]}</span>
            <span class="text-[11px] font-bold">${p.name}</span>
            <span class="text-[10px] font-mono text-emerald-400 ml-0.5">${p.tokensFinished}/4</span>
            ${p.finishRank ? `<span class="text-[9px] text-amber-400 font-mono font-bold">#${p.finishRank}</span>` : ''}
          </div>
        `;
      })
      .join('');
  }
}

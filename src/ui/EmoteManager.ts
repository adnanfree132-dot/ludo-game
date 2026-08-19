export interface EmoteOption {
  emoji: string;
  label: string;
}

export const AVAILABLE_EMOTES: EmoteOption[] = [
  { emoji: '🎲', label: 'Roll high!' },
  { emoji: '🔥', label: 'On fire!' },
  { emoji: '👑', label: 'Victory!' },
  { emoji: '😎', label: 'Calculated' },
  { emoji: '😱', label: 'No way!' },
  { emoji: '👏', label: 'Good move' },
  { emoji: '🎯', label: 'Target locked' },
  { emoji: '⚡', label: 'Speed up' },
];

export class EmoteManager {
  private onSendEmoteCallback: ((emoji: string, label: string) => void) | null = null;

  constructor() {}

  public onSendEmote(cb: (emoji: string, label: string) => void): void {
    this.onSendEmoteCallback = cb;
  }

  /**
   * Displays an animated floating emote bubble next to a player's quadrant or card.
   */
  public displayEmote(playerIndex: number, emoji: string, label?: string): void {
    const cardEl = document.getElementById(`player-card-${playerIndex}`) || document.getElementById(`mobile-player-${playerIndex}`);
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'emote-bubble animate-bounce-in';
    bubble.innerHTML = `
      <span class="text-2xl">${emoji}</span>
      ${label ? `<span class="text-[10px] font-bold text-white bg-zinc-900/90 px-2 py-0.5 rounded-full border border-white/10 shadow-sm">${label}</span>` : ''}
    `;

    // Position bubble above the target player card
    bubble.style.position = 'fixed';
    bubble.style.left = `${Math.max(10, rect.left + rect.width / 2 - 40)}px`;
    bubble.style.top = `${Math.max(10, rect.top - 40)}px`;
    bubble.style.zIndex = '100';

    document.body.appendChild(bubble);

    setTimeout(() => {
      bubble.classList.add('fade-out');
      setTimeout(() => {
        bubble.remove();
      }, 300);
    }, 2200);
  }

  /**
   * Generates the HTML for the quick emote picker bar.
   */
  public renderQuickPicker(): string {
    return `
      <div id="emote-picker-bar" class="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar max-w-[170px] sm:max-w-none">
        ${AVAILABLE_EMOTES.map(
          (e) => `
          <button data-emoji="${e.emoji}" data-label="${e.label}" class="emote-btn w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-xs sm:text-base hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0" title="${e.label}">
            ${e.emoji}
          </button>
        `
        ).join('')}
      </div>
    `;
  }

  public bindPickerEvents(): void {
    document.querySelectorAll('.emote-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const emoji = target.dataset.emoji || '🎲';
        const label = target.dataset.label || '';
        if (this.onSendEmoteCallback) {
          this.onSendEmoteCallback(emoji, label);
        }
      });
    });
  }
}

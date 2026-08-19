import { RoomSlotInfo } from '../network/Protocol';
import { PlayerColor } from '../engine/Types';

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

export class OnlineLobbyModal {
  private overlayEl: HTMLElement | null = null;
  private modalEl: HTMLElement | null = null;

  private onStartGameCallback: (() => void) | null = null;
  private onToggleBotCallback: ((slotIndex: number) => void) | null = null;
  private onReadyToggleCallback: ((isReady: boolean) => void) | null = null;
  private onLeaveRoomCallback: (() => void) | null = null;

  private isHost: boolean = false;
  private currentSlots: RoomSlotInfo[] = [];
  private currentRoomCode: string = '';
  private isClientReady: boolean = true;

  constructor() {
    this.overlayEl = document.getElementById('modal-overlay');
    this.modalEl = document.getElementById('lobby-modal');
  }

  public onStartGame(cb: () => void): void {
    this.onStartGameCallback = cb;
  }

  public onToggleBot(cb: (slotIndex: number) => void): void {
    this.onToggleBotCallback = cb;
  }

  public onReadyToggle(cb: (isReady: boolean) => void): void {
    this.onReadyToggleCallback = cb;
  }

  public onLeaveRoom(cb: () => void): void {
    this.onLeaveRoomCallback = cb;
  }

  public show(roomCode: string, slots: RoomSlotInfo[], isHost: boolean): void {
    if (!this.overlayEl || !this.modalEl) return;
    this.currentRoomCode = roomCode;
    this.currentSlots = slots;
    this.isHost = isHost;

    this.render();
    this.overlayEl.classList.remove('hidden');
    this.modalEl.classList.remove('hidden');
  }

  public updateSlots(slots: RoomSlotInfo[]): void {
    this.currentSlots = slots;
    this.render();
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
      <div class="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-base text-blue-400">
            🌐
          </div>
          <div>
            <h2 class="text-lg font-black text-white tracking-tight">Online Room Lobby</h2>
            <p class="text-[11px] text-zinc-400 font-mono">P2P WebRTC Connected</p>
          </div>
        </div>
        <button id="btn-lobby-leave" class="text-xs text-zinc-400 hover:text-rose-400 font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors">
          Leave Room
        </button>
      </div>

      <!-- Room Code Banner -->
      <div class="mb-5 p-3.5 rounded-2xl bg-zinc-950/80 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Room Code</div>
          <div class="text-2xl font-black text-blue-400 font-mono tracking-widest">${this.currentRoomCode}</div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button id="btn-copy-code" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold font-mono transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <span>📋</span>
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      <!-- 4 Player Slots Grid -->
      <div class="mb-5">
        <div class="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2.5 flex items-center justify-between">
          <span>Connected Players (4/4 Seats)</span>
          <span class="text-emerald-400 text-[10px]">Unfilled seats run by AI</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          ${this.currentSlots
            .map((slot) => {
              const colorName = COLOR_NAMES[slot.color];
              const emoji = COLOR_EMOJIS[slot.color];
              const isOccupied = !slot.isBot && slot.name !== 'Waiting...';

              return `
              <div class="p-3 rounded-2xl bg-zinc-900/90 border ${
                isOccupied ? `border-${slot.color}-500/50 shadow-md` : 'border-zinc-800'
              } flex flex-col justify-between gap-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">${emoji}</span>
                    <div>
                      <div class="text-xs font-bold text-white flex items-center gap-1">
                        <span>${slot.name}</span>
                        ${slot.isHost ? `<span class="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">HOST</span>` : ''}
                      </div>
                      <div class="text-[10px] text-zinc-400 font-mono">${colorName}</div>
                    </div>
                  </div>
                  <span class="w-2 h-2 rounded-full ${isOccupied ? 'bg-emerald-400' : 'bg-zinc-600'}"></span>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] font-mono">
                  <span class="${slot.isBot ? 'text-amber-400' : 'text-emerald-400 font-bold'}">
                    ${slot.isBot ? '🤖 AI Bot' : '🟢 Ready'}
                  </span>

                  ${
                    this.isHost && !slot.isHost
                      ? `
                    <button data-toggle-slot="${slot.playerIndex}" class="btn-toggle-bot text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
                      ${slot.isBot ? 'Open Seat' : 'Make Bot'}
                    </button>
                  `
                      : ''
                  }
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-2">
        ${
          this.isHost
            ? `
          <button id="btn-start-online-match" class="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>🚀</span>
            <span>LAUNCH MATCH NOW</span>
          </button>
        `
            : `
          <div class="flex flex-col gap-2">
            <button id="btn-toggle-ready" class="w-full py-2.5 rounded-xl ${this.isClientReady ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'} font-bold text-xs transition-all">
              ${this.isClientReady ? '🟢 Ready for Match' : '⚪ Click to Ready'}
            </button>
            <div class="p-2 rounded-xl bg-zinc-950 text-center border border-zinc-800 text-[11px] text-zinc-400">
              <span>Waiting for Host to launch match...</span>
            </div>
          </div>
        `
        }
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Copy code button
    document.getElementById('btn-copy-code')?.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}?room=${this.currentRoomCode}`;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        alert(`Room link copied! (${shareUrl})`);
      }
    });

    // Leave room button
    document.getElementById('btn-lobby-leave')?.addEventListener('click', () => {
      this.hide();
      if (this.onLeaveRoomCallback) this.onLeaveRoomCallback();
    });

    // Host start game button
    document.getElementById('btn-start-online-match')?.addEventListener('click', () => {
      if (this.onStartGameCallback) this.onStartGameCallback();
    });

    // Client toggle ready
    document.getElementById('btn-toggle-ready')?.addEventListener('click', () => {
      this.isClientReady = !this.isClientReady;
      this.render();
      if (this.onReadyToggleCallback) this.onReadyToggleCallback(this.isClientReady);
    });

    // Host toggle bot buttons
    document.querySelectorAll('.btn-toggle-bot').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const slotIdx = Number((e.currentTarget as HTMLElement).dataset.toggleSlot);
        if (this.onToggleBotCallback) this.onToggleBotCallback(slotIdx);
      });
    });
  }
}

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

    const connectedCount = this.currentSlots.filter((s) => s.isHost || Boolean(s.peerId)).length;
    const canLaunch = connectedCount >= 2;

    this.modalEl.innerHTML = `
      <div class="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-base text-blue-400">
            🌐
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-white tracking-tight">Online Room Lobby</h2>
            <p class="text-[10.5px] sm:text-[11px] text-zinc-400 font-mono">P2P Realtime Multiplayer (Real Players Only)</p>
          </div>
        </div>
        <button id="btn-lobby-leave" class="text-xs text-zinc-400 hover:text-rose-400 font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors">
          Leave
        </button>
      </div>

      <!-- Room Code Banner -->
      <div class="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-2xl bg-zinc-950/80 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-inner">
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Room Code</div>
          <div class="text-2xl font-black text-blue-400 font-mono tracking-widest">${this.currentRoomCode}</div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button id="btn-copy-code" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold font-mono transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <span>📋</span>
            <span>Copy Invite Link</span>
          </button>
        </div>
      </div>

      <!-- 4 Player Slots Grid -->
      <div class="mb-4 sm:mb-5">
        <div class="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2.5 flex items-center justify-between">
          <span>Connected Players (${connectedCount}/4)</span>
          <span class="${canLaunch ? 'text-emerald-400 font-bold' : 'text-amber-400'} text-[10px]">
            ${canLaunch ? 'Ready to play!' : 'Waiting for at least 1 friend (2-4 players)'}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          ${this.currentSlots
            .map((slot) => {
              const colorName = COLOR_NAMES[slot.color];
              const emoji = COLOR_EMOJIS[slot.color];
              const isOccupied = slot.isHost || Boolean(slot.peerId);

              return `
              <div class="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/90 border ${
                isOccupied ? 'border-zinc-700 shadow-md' : 'border-zinc-800/60 opacity-60'
              } flex flex-col justify-between gap-1.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">${emoji}</span>
                    <div>
                      <div class="text-xs font-bold text-white flex items-center gap-1">
                        <span class="truncate max-w-[120px]">${isOccupied ? slot.name : 'Waiting for player...'}</span>
                        ${slot.isHost ? `<span class="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">HOST</span>` : ''}
                      </div>
                      <div class="text-[10px] text-zinc-400 font-mono">${colorName}</div>
                    </div>
                  </div>
                  <span class="w-2 h-2 rounded-full ${isOccupied ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}"></span>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] font-mono">
                  <span class="${isOccupied ? 'text-emerald-400 font-bold' : 'text-zinc-500'}">
                    ${isOccupied ? (slot.isHost ? '👑 Host' : '🟢 Connected') : '⏳ Open Seat'}
                  </span>
                  <span class="text-[9px] text-zinc-500">Seat ${slot.playerIndex + 1}</span>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-1 sm:pt-2">
        ${
          this.isHost
            ? `
          ${
            canLaunch
              ? `
            <button id="btn-start-online-match" class="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>START MATCH (${connectedCount} PLAYERS)</span>
            </button>
          `
              : `
            <button disabled class="w-full py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2">
              <span>⏳</span>
              <span>WAITING FOR PLAYERS TO JOIN (NEED 2-4 PLAYERS)</span>
            </button>
          `
          }
        `
            : `
          <div class="flex flex-col gap-2">
            <div class="p-2.5 rounded-xl bg-zinc-950 text-center border border-zinc-800 text-[11px] text-zinc-300 font-mono">
              <span>🟢 Connected! Waiting for Host to start match (${connectedCount}/4 players joined)...</span>
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
  }
}

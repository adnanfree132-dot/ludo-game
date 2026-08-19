import { DiceState } from '../engine/Types';

export class DiceRenderer {
  private cubeEl: HTMLElement | null;
  private btnEl: HTMLButtonElement | null;
  private hintEl: HTMLElement | null;
  private onRollCallback: (() => void) | null = null;
  private isLocked: boolean = false;

  constructor(_containerId: string) {
    this.cubeEl = document.getElementById('dice-cube');
    this.btnEl = document.getElementById('roll-dice-btn') as HTMLButtonElement;
    this.hintEl = document.getElementById('dice-hint');

    this.bindEvents();
  }

  public onRoll(cb: () => void): void {
    this.onRollCallback = cb;
  }

  private bindEvents(): void {
    const triggerRoll = () => {
      if (this.isLocked) return;
      if (this.onRollCallback) {
        this.onRollCallback();
      }
    };

    if (this.cubeEl) {
      this.cubeEl.addEventListener('click', triggerRoll);
    }
    if (this.btnEl) {
      this.btnEl.addEventListener('click', triggerRoll);
    }
  }

  public setLocked(locked: boolean): void {
    this.isLocked = locked;
    if (this.btnEl) {
      this.btnEl.disabled = locked;
      this.btnEl.classList.toggle('opacity-50', locked);
      this.btnEl.classList.toggle('cursor-not-allowed', locked);
      this.btnEl.classList.toggle('shadow-rose-500/25', !locked);
    }
    if (this.cubeEl) {
      this.cubeEl.style.cursor = locked ? 'default' : 'pointer';
    }
  }

  public setHint(text: string, colorClass: string = 'text-rose-400'): void {
    if (this.hintEl) {
      this.hintEl.textContent = text;
      this.hintEl.className = `text-[11px] font-mono uppercase tracking-wider font-bold ${colorClass}`;
    }
  }

  /**
   * Triggers realistic 3D tumble animation before settling on the rolled face value.
   */
  public animateRoll(finalValue: number, onComplete?: () => void): void {
    if (!this.cubeEl) return;

    this.setLocked(true);
    this.cubeEl.classList.add('rolling');

    setTimeout(() => {
      if (this.cubeEl) {
        this.cubeEl.classList.remove('rolling');
        this.cubeEl.setAttribute('data-value', String(finalValue));
      }
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 250);
    }, 550);
  }

  public update(dice: DiceState, isHumanTurn: boolean, isAiThinking: boolean, phase: string = 'waiting_roll'): void {
    if (!this.cubeEl) return;

    if (!dice.isRolling) {
      this.cubeEl.setAttribute('data-value', String(dice.currentValue));
    }

    if (isAiThinking) {
      this.setLocked(true);
      this.setHint('Computer Thinking...', 'text-amber-400');
    } else if (isHumanTurn) {
      if (phase === 'selecting_move') {
        this.setLocked(true);
        this.setHint('Select Token To Move', 'text-rose-400 font-black animate-pulse');
      } else {
        this.setLocked(false);
        this.setHint('Your Turn : Roll Dice', 'text-emerald-400 font-black');
      }
    } else {
      this.setLocked(true);
      this.setHint('Opponent Turn', 'text-zinc-500');
    }
  }
}

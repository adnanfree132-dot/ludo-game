import { GameState, PlayerColor, Token, BoardTheme } from '../engine/Types';
import {
  TRACK_COORDINATES,
  HOME_PATH_COORDINATES,
  BASE_YARD_SLOTS,
  SAFE_SQUARES,
  START_OFFSETS,
} from '../engine/BoardTopology';
import { calculateTargetStep } from '../engine/LudoRules';

interface ThemePalette {
  boardBg: string;
  gridStroke: string;
  yardFill: string;
  tileBg: string;
  tileBorder: string;
  safeTileBg: string;
  safeTileBorder: string;
}

const THEME_PALETTES: Record<BoardTheme, ThemePalette> = {
  obsidian: {
    boardBg: '#0e0e13',
    gridStroke: '#1f1f28',
    yardFill: '#14141c',
    tileBg: '#181822',
    tileBorder: '#272736',
    safeTileBg: '#231e33',
    safeTileBorder: '#9333ea',
  },
  cyberpunk: {
    boardBg: '#050814',
    gridStroke: '#0d1830',
    yardFill: '#091124',
    tileBg: '#0c1a38',
    tileBorder: '#1e3a6a',
    safeTileBg: '#1f0d36',
    safeTileBorder: '#ec4899',
  },
  royal_glass: {
    boardBg: '#0a0e1a',
    gridStroke: '#182238',
    yardFill: '#10172a',
    tileBg: '#131e36',
    tileBorder: '#25355a',
    safeTileBg: '#2b2612',
    safeTileBorder: '#eab308',
  },
  classic_wood: {
    boardBg: '#1c1510',
    gridStroke: '#2d221a',
    yardFill: '#241b14',
    tileBg: '#2e2219',
    tileBorder: '#453326',
    safeTileBg: '#382516',
    safeTileBorder: '#d97706',
  },
};

const COLOR_MAP: Record<PlayerColor, { main: string; light: string; glow: string; dark: string; text: string }> = {
  red: { main: '#f43f5e', light: '#fb7185', glow: 'rgba(244, 63, 94, 0.65)', dark: '#881337', text: 'RED' },
  green: { main: '#10b981', light: '#34d399', glow: 'rgba(16, 185, 129, 0.65)', dark: '#064e3b', text: 'GREEN' },
  yellow: { main: '#f59e0b', light: '#fbbf24', glow: 'rgba(245, 158, 11, 0.65)', dark: '#78350f', text: 'YELLOW' },
  blue: { main: '#3b82f6', light: '#60a5fa', glow: 'rgba(59, 130, 246, 0.65)', dark: '#1e3a8a', text: 'BLUE' },
};

export class BoardRenderer {
  private containerEl: HTMLElement;
  private onTokenClickCallback: ((tokenId: string) => void) | null = null;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Board viewport container #${containerId} not found`);
    this.containerEl = el;
  }

  public onTokenClick(cb: (tokenId: string) => void): void {
    this.onTokenClickCallback = cb;
  }

  /**
   * Renders full SVG board geometry and interactive token layer.
   */
  public render(state: Readonly<GameState>): void {
    const theme = THEME_PALETTES[state.theme || 'obsidian'];

    this.containerEl.innerHTML = `
      <svg viewBox="0 0 1500 1500" class="w-full h-full rounded-3xl select-none filter drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradients -->
          <linearGradient id="board-mat-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${theme.boardBg}" />
            <stop offset="100%" stop-color="#050508" />
          </linearGradient>

          <filter id="token-elevation" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.7" />
          </filter>

          <filter id="tile-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Base Background -->
        <rect width="1500" height="1500" rx="36" fill="url(#board-mat-gradient)" stroke="${theme.gridStroke}" stroke-width="4" />

        <!-- Quadrant Home Bases (6x6 cells each) -->
        ${this.renderHomeBases(theme)}

        <!-- 52 Track Tiles & Home Paths -->
        ${this.renderTrackTiles(theme)}

        <!-- Center Victory Podium Zone -->
        ${this.renderCenterVictoryZone()}

        <!-- Interactive Token Pieces Layer -->
        ${this.renderTokens(state)}
      </svg>
    `;

    this.bindTokenEvents(state);
  }

  private renderHomeBases(theme: ThemePalette): string {
    const renderBase = (color: PlayerColor, tx: number, ty: number) => {
      const c = COLOR_MAP[color];
      return `
        <g id="base-${color}" transform="translate(${tx}, ${ty})">
          <!-- Outer base card -->
          <rect width="600" height="600" rx="32" fill="${theme.yardFill}" stroke="${c.main}" stroke-width="2.5" stroke-opacity="0.4" />
          
          <!-- Inner yard plateau -->
          <rect x="70" y="70" width="460" height="460" rx="26" fill="${c.main}" fill-opacity="0.08" stroke="${c.main}" stroke-width="1.5" stroke-opacity="0.25" />

          <!-- 4 Token Nesting Docks -->
          <circle cx="180" cy="180" r="54" fill="${theme.boardBg}" stroke="${c.main}" stroke-width="2" stroke-opacity="0.5" />
          <circle cx="180" cy="180" r="28" fill="${c.main}" fill-opacity="0.15" />

          <circle cx="420" cy="180" r="54" fill="${theme.boardBg}" stroke="${c.main}" stroke-width="2" stroke-opacity="0.5" />
          <circle cx="420" cy="180" r="28" fill="${c.main}" fill-opacity="0.15" />

          <circle cx="180" cy="420" r="54" fill="${theme.boardBg}" stroke="${c.main}" stroke-width="2" stroke-opacity="0.5" />
          <circle cx="180" cy="420" r="28" fill="${c.main}" fill-opacity="0.15" />

          <circle cx="420" cy="420" r="54" fill="${theme.boardBg}" stroke="${c.main}" stroke-width="2" stroke-opacity="0.5" />
          <circle cx="420" cy="420" r="28" fill="${c.main}" fill-opacity="0.15" />

          <!-- Quadrant Badge Label -->
          <rect x="220" y="278" width="160" height="44" rx="22" fill="${theme.boardBg}" stroke="${c.main}" stroke-width="1.5" stroke-opacity="0.4" />
          <text x="300" y="306" font-size="20" font-weight="900" fill="${c.light}" text-anchor="middle" letter-spacing="3" font-family="'JetBrains Mono', monospace">${c.text}</text>
        </g>
      `;
    };

    return `
      ${renderBase('red', 0, 0)}
      ${renderBase('green', 900, 0)}
      ${renderBase('yellow', 900, 900)}
      ${renderBase('blue', 0, 900)}
    `;
  }

  private renderTrackTiles(theme: ThemePalette): string {
    let tiles = '';

    // Render 52 main outer track tiles
    TRACK_COORDINATES.forEach((coord, idx) => {
      const x = coord.x * 100 + 2;
      const y = coord.y * 100 + 2;
      const isSafe = SAFE_SQUARES.has(idx);

      let tileBg = theme.tileBg;
      let border = theme.tileBorder;
      let strokeWidth = 1.5;
      let icon = '';

      if (idx === START_OFFSETS.red) {
        tileBg = '#3b0d18';
        border = '#f43f5e';
        strokeWidth = 2;
        icon = '▶';
      } else if (idx === START_OFFSETS.green) {
        tileBg = '#062d22';
        border = '#10b981';
        strokeWidth = 2;
        icon = '▶';
      } else if (idx === START_OFFSETS.yellow) {
        tileBg = '#331d06';
        border = '#f59e0b';
        strokeWidth = 2;
        icon = '◀';
      } else if (idx === START_OFFSETS.blue) {
        tileBg = '#0e1d3d';
        border = '#3b82f6';
        strokeWidth = 2;
        icon = '▲';
      } else if (isSafe) {
        tileBg = theme.safeTileBg;
        border = theme.safeTileBorder;
        icon = '★';
      }

      tiles += `
        <g id="tile-${coord.x}-${coord.y}" transform="translate(${x}, ${y})">
          <rect id="tile-rect-${coord.x}-${coord.y}" width="96" height="96" rx="16" fill="${tileBg}" stroke="${border}" stroke-width="${strokeWidth}" fill-opacity="0.9" />
          ${icon ? `<text x="48" y="58" font-size="24" font-weight="bold" fill="${border}" text-anchor="middle">${icon}</text>` : ''}
        </g>
      `;
    });

    // Render colored home path runs (5 steps each)
    const renderPath = (color: PlayerColor) => {
      const coords = HOME_PATH_COORDINATES[color];
      const c = COLOR_MAP[color];
      let pathSvg = '';

      for (let i = 0; i < 5; i++) {
        const coord = coords[i];

        pathSvg += `
          <g id="tile-${coord.x}-${coord.y}" transform="translate(${coord.x * 100 + 2}, ${coord.y * 100 + 2})">
            <rect id="tile-rect-${coord.x}-${coord.y}" width="96" height="96" rx="16" fill="${c.main}" stroke="${c.light}" stroke-width="2" fill-opacity="0.85" />
            <circle cx="48" cy="48" r="7" fill="#ffffff" fill-opacity="0.8" />
          </g>
        `;
      }
      return pathSvg;
    };

    tiles += renderPath('red');
    tiles += renderPath('green');
    tiles += renderPath('yellow');
    tiles += renderPath('blue');

    return tiles;
  }

  private renderCenterVictoryZone(): string {
    // 3x3 cells in center: (600, 600) to (900, 900)
    return `
      <g id="center-home" transform="translate(600, 600)">
        <!-- Red Triangle -->
        <polygon points="0,0 150,150 0,300" fill="#f43f5e" fill-opacity="0.9" stroke="#fb7185" stroke-width="2" />
        <!-- Green Triangle -->
        <polygon points="0,0 300,0 150,150" fill="#10b981" fill-opacity="0.9" stroke="#34d399" stroke-width="2" />
        <!-- Yellow Triangle -->
        <polygon points="300,0 300,300 150,150" fill="#f59e0b" fill-opacity="0.9" stroke="#fbbf24" stroke-width="2" />
        <!-- Blue Triangle -->
        <polygon points="0,300 300,300 150,150" fill="#3b82f6" fill-opacity="0.9" stroke="#60a5fa" stroke-width="2" />

        <!-- Center Crown Jewel -->
        <circle cx="150" cy="150" r="48" fill="#121217" stroke="#ffffff" stroke-width="3" />
        <circle cx="150" cy="150" r="42" fill="#1e1e28" />
        <text x="150" y="163" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle">👑</text>
      </g>
    `;
  }

  private renderTokens(state: Readonly<GameState>): string {
    let tokensSvg = '';
    const activePlayer = state.players[state.activePlayerIndex];

    // Build map to detect multiple tokens sharing the same cell and offset them cleanly
    const cellTokenMap = new Map<string, Token[]>();

    for (const player of state.players) {
      for (const token of player.tokens) {
        const cellKey = token.state === 'base' || token.stepCount === -1
          ? `base-${token.color}-${token.tokenIndex}`
          : token.state === 'track' && token.globalPos !== null
          ? `track-${token.globalPos}`
          : token.state === 'home_path'
          ? `home-${token.color}-${token.stepCount}`
          : `center-${token.color}`;

        if (!cellTokenMap.has(cellKey)) {
          cellTokenMap.set(cellKey, []);
        }
        cellTokenMap.get(cellKey)!.push(token);
      }
    }

    for (const player of state.players) {
      const c = COLOR_MAP[player.color];

      player.tokens.forEach((token) => {
        const baseCoord = this.getTokenPixelCoordinates(token);
        const cellKey = token.state === 'base' || token.stepCount === -1
          ? `base-${token.color}-${token.tokenIndex}`
          : token.state === 'track' && token.globalPos !== null
          ? `track-${token.globalPos}`
          : token.state === 'home_path'
          ? `home-${token.color}-${token.stepCount}`
          : `center-${token.color}`;

        const tokensInCell = cellTokenMap.get(cellKey) || [];
        let offsetX = 0;
        let offsetY = 0;

        if (tokensInCell.length > 1 && token.state !== 'base') {
          const indexInCell = tokensInCell.indexOf(token);
          const count = tokensInCell.length;
          if (count === 2) {
            offsetX = indexInCell === 0 ? -12 : 12;
            offsetY = indexInCell === 0 ? -12 : 12;
          } else if (count === 3) {
            const angle = (indexInCell * 2 * Math.PI) / 3;
            offsetX = Math.round(Math.cos(angle) * 14);
            offsetY = Math.round(Math.sin(angle) * 14);
          } else {
            const offsets = [
              { x: -14, y: -14 },
              { x: 14, y: -14 },
              { x: -14, y: 14 },
              { x: 14, y: 14 },
            ];
            offsetX = offsets[indexInCell % 4].x;
            offsetY = offsets[indexInCell % 4].y;
          }
        }

        const x = baseCoord.x + offsetX;
        const y = baseCoord.y + offsetY;
        const isEligible = Boolean(activePlayer && activePlayer.index === player.index && token.isEligible && state.phase === 'selecting_move');

        tokensSvg += `
          <g id="token-elem-${token.id}" data-token-id="${token.id}" transform="translate(${x}, ${y})" class="token-piece" style="cursor: ${isEligible ? 'pointer' : 'default'}">
            <!-- Invisible Touch & Tap Hitbox Target for Mobile -->
            <circle cx="0" cy="0" r="48" fill="transparent" />

            <g class="token-body ${isEligible ? 'eligible' : ''}">
              <!-- Shadow Halo -->
              <circle cx="0" cy="0" r="32" fill="#000000" fill-opacity="0.45" />

              <!-- Luminous Token Outer Ring -->
              <circle cx="0" cy="0" r="30" fill="${c.main}" stroke="#ffffff" stroke-width="3" filter="url(#token-elevation)" />

              <!-- Inner Bevel Glass Layer -->
              <circle cx="0" cy="0" r="21" fill="${c.light}" fill-opacity="0.4" />
              <circle cx="0" cy="0" r="14" fill="#ffffff" fill-opacity="0.95" />
              <circle cx="0" cy="0" r="8" fill="${c.dark}" />

              <!-- Selection / Eligibility Pulse Ring -->
              ${
                isEligible
                  ? `
                <circle cx="0" cy="0" r="38" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="6,4" class="animate-spin-slow" />
              `
                  : ''
              }
            </g>
          </g>
        `;
      });
    }

    return tokensSvg;
  }

  private getTokenPixelCoordinates(token: Token): { x: number; y: number } {
    if (token.state === 'base' || token.stepCount === -1) {
      const slot = BASE_YARD_SLOTS[token.color][token.tokenIndex];
      return { x: slot.x, y: slot.y };
    }

    if (token.state === 'track' && token.globalPos !== null) {
      const coord = TRACK_COORDINATES[token.globalPos];
      return { x: coord.x * 100 + 50, y: coord.y * 100 + 50 };
    }

    if (token.state === 'home_path') {
      const pathIndex = token.stepCount - 51;
      const coord = HOME_PATH_COORDINATES[token.color][pathIndex];
      return { x: coord.x * 100 + 50, y: coord.y * 100 + 50 };
    }

    // Finished in Center Victory Zone
    const centerOffsets: Record<PlayerColor, { x: number; y: number }> = {
      red: { x: 675, y: 750 },
      green: { x: 750, y: 675 },
      yellow: { x: 825, y: 750 },
      blue: { x: 750, y: 825 },
    };
    return centerOffsets[token.color];
  }

  private highlightTargetTile(state: Readonly<GameState>, tokenId: string): void {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    const token = activePlayer.tokens.find((t) => t.id === tokenId);
    if (!token || !token.isEligible) return;

    const targetStep = calculateTargetStep(token, state.dice.currentValue);
    let targetCoord: { x: number; y: number } | null = null;

    if (targetStep === 0 || (targetStep > 0 && targetStep <= 50)) {
      const startOffset = START_OFFSETS[token.color];
      const targetGlobal = (startOffset + targetStep) % 52;
      targetCoord = TRACK_COORDINATES[targetGlobal];
    } else if (targetStep >= 51 && targetStep <= 55) {
      const pathIdx = targetStep - 51;
      targetCoord = HOME_PATH_COORDINATES[token.color][pathIdx];
    }

    if (targetCoord) {
      const rectEl = document.getElementById(`tile-rect-${targetCoord.x}-${targetCoord.y}`);
      if (rectEl) {
        rectEl.classList.add('projected-tile-highlight');
      }
    }
  }

  private clearTargetHighlight(): void {
    const highlighted = this.containerEl.querySelectorAll('.projected-tile-highlight');
    highlighted.forEach((el) => el.classList.remove('projected-tile-highlight'));
  }

  private bindTokenEvents(state: Readonly<GameState>): void {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    activePlayer.tokens.forEach((token) => {
      if (!token.isEligible) return;

      const tokenEl = document.getElementById(`token-elem-${token.id}`);
      if (!tokenEl) return;

      tokenEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearTargetHighlight();
        if (this.onTokenClickCallback) {
          this.onTokenClickCallback(token.id);
        }
      });

      tokenEl.addEventListener('mouseenter', () => {
        this.highlightTargetTile(state, token.id);
      });

      tokenEl.addEventListener('mouseleave', () => {
        this.clearTargetHighlight();
      });
    });
  }
}

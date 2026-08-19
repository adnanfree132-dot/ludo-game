import { PlayerColor } from './Types';

export const TRACK_TOTAL_TILES = 52;
export const HOME_PATH_TILES = 5;
export const TOTAL_STEPS_TO_HOME = 56; // 0..50 (outer 51 steps), 51..55 (home path 5 steps), 56 (center)

export const START_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const SAFE_SQUARES: ReadonlySet<number> = new Set([
  0,  // Red Start
  8,  // Star 1
  13, // Green Start
  21, // Star 2
  26, // Yellow Start
  34, // Star 3
  39, // Blue Start
  47, // Star 4
]);

/**
 * Maps player quadrant color and stepCount (0..56) to outer track global position (0..51)
 * Returns null if the token is in Base (-1), in Home Path (51..55), or in Center (56).
 */
export function getGlobalPosition(color: PlayerColor, stepCount: number): number | null {
  if (stepCount < 0 || stepCount > 50) {
    return null;
  }
  const startOffset = START_OFFSETS[color];
  return (startOffset + stepCount) % TRACK_TOTAL_TILES;
}

/**
 * Checks if a global track position is a non-capturable safe square.
 */
export function isSafePosition(globalPos: number | null): boolean {
  if (globalPos === null) return true; // Home path & center are always safe
  return SAFE_SQUARES.has(globalPos);
}

/**
 * 15x15 Standard Ludo Board Grid Coordinate Mapping for outer track (0..51)
 * Grid is (x, y) with (0, 0) at top-left and (14, 14) at bottom-right.
 */
export const TRACK_COORDINATES: { x: number; y: number }[] = [
  // 0..4: Red exit going right
  { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  // 5..10: Going up to Green
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
  // 11..12: Green corner
  { x: 7, y: 0 }, { x: 8, y: 0 },
  // 13..17: Green exit going down
  { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
  // 18..23: Going right to Yellow
  { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
  // 24..25: Yellow corner
  { x: 14, y: 7 }, { x: 14, y: 8 },
  // 26..30: Yellow exit going left
  { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  // 31..36: Going down to Blue
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
  // 37..38: Blue corner
  { x: 7, y: 14 }, { x: 6, y: 14 },
  // 39..43: Blue exit going up
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  // 44..49: Going left back to Red
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
  // 50..51: Red corner
  { x: 0, y: 7 }, { x: 0, y: 6 },
];

/**
 * 15x15 Home Path Grid Coordinates (steps 51..55) and Center (56) per color
 */
export const HOME_PATH_COORDINATES: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, // 51..55
    { x: 6, y: 7 } // 56 (Center)
  ],
  green: [
    { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 },
    { x: 7, y: 6 }
  ],
  yellow: [
    { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 },
    { x: 8, y: 7 }
  ],
  blue: [
    { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 },
    { x: 7, y: 8 }
  ]
};

/**
 * Base Yard 4-slot coordinate positions per color on 15x15 grid
 */
export const BASE_YARD_SLOTS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [
    { x: 1.8, y: 1.8 }, { x: 3.8, y: 1.8 },
    { x: 1.8, y: 3.8 }, { x: 3.8, y: 3.8 }
  ],
  green: [
    { x: 10.8, y: 1.8 }, { x: 12.8, y: 1.8 },
    { x: 10.8, y: 3.8 }, { x: 12.8, y: 3.8 }
  ],
  yellow: [
    { x: 10.8, y: 10.8 }, { x: 12.8, y: 10.8 },
    { x: 10.8, y: 12.8 }, { x: 12.8, y: 12.8 }
  ],
  blue: [
    { x: 1.8, y: 10.8 }, { x: 3.8, y: 10.8 },
    { x: 1.8, y: 12.8 }, { x: 3.8, y: 12.8 }
  ]
};

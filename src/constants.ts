import type { CounterKey, Dir, Layout, LossCause, ManaColor } from './types';

// ---- storage ----

export const STATE_KEY = 'edh-hub/state';
export const STATE_BACKUP_KEY = 'edh-hub/state-backup';
/** Pinned commander names, per device; kept apart from the game so resets don't touch them. */
export const PINS_KEY = 'edh-hub/pinned-commanders';
export const UNDO_LIMIT = 20;

// ---- game ----

export const MAX_PLAYERS = 6;
export const DEFAULT_PLAYER_COUNT = 4;
export const DEFAULT_LIFE = 40;
export const LIFE_PRESETS = [20, 30, 40];
export const PLAYER_COUNTS = [2, 3, 4, 5, 6];
export const LETHAL_POISON = 10;
export const LETHAL_CMD_DAMAGE = 21;
export const ROLL_DIE = 20;

export const MANA: ManaColor[] = ['W', 'U', 'B', 'R', 'G', 'C'];
/** Colors shown in the mana pool overlay. */
export const POOL_MANA: ManaColor[] = ['W', 'U', 'B', 'R', 'G'];

export const ALL_COUNTERS: CounterKey[] = [
  'poison',
  'experience',
  'monarch',
  'initiative',
  'energy',
  'rad',
  'tax',
  'storm',
];
export const DEFAULT_COUNTERS: CounterKey[] = ['tax', 'storm', 'poison'];
export const MAX_VISIBLE_COUNTERS = 5;

export const COUNTER_LABEL: Record<CounterKey, string> = {
  poison: 'Poison',
  experience: 'Experience',
  monarch: 'Monarch',
  initiative: 'Initiative',
  energy: 'Energy',
  rad: 'Rad',
  tax: 'Commander tax',
  tax2: 'Commander tax (second commander)',
  storm: 'Storm',
};

/** Mana font classes per counter; monarch and experience are drawn as SVG. */
export const COUNTER_MS_CLASS: Partial<Record<CounterKey, string>> = {
  poison: 'ms-p',
  energy: 'ms-e',
  rad: 'ms-counter-rad',
  tax: 'ms-commander',
  tax2: 'ms-commander',
  storm: 'ms-counter-flame',
  initiative: 'ms-dungeon',
};

/** Bright mid-tone cell colors; text and icons on them are white. */
export const PALETTE = [
  '#4f8fe8',
  '#ec5f57',
  '#34b46e',
  '#9a6ff0',
  '#f0922e',
  '#22aea4',
  '#e7609f',
  '#7d8796',
  '#c9a043',
  '#6f78ee',
];
/** Earlier palettes, mapped index-for-index onto the current one when loading old saves. */
export const OLD_PALETTES = [
  ['#2f6fb3', '#b8423a', '#2f8f55', '#7b4bb0', '#c27c1a', '#1f8f8a', '#b2457f', '#5a6472', '#8a6d3b', '#3c3f99'],
  ['#8ab8f0', '#f4978e', '#8fd9a8', '#c3a6ef', '#f7c77e', '#7fd6cf', '#f4a6cb', '#c9d1db', '#e3cf9f', '#a9adf5'],
];

// ---- table layout ----

const T = 1 / 3;

// Seats are listed clockwise around the table, viewed from above:
// bottom edge -> left side (bottom to top) -> top edge -> right side (top to bottom).
export const LAYOUTS: Record<number, Layout> = {
  2: {
    seats: [
      { x: 0, y: 0.5, w: 1, h: 0.5, dir: 'd' },
      { x: 0, y: 0, w: 1, h: 0.5, dir: 'u' },
    ],
    hub: [0.5, 0.5],
  },
  3: {
    seats: [
      { x: 0, y: 0.4, w: 0.5, h: 0.6, dir: 'l' },
      { x: 0, y: 0, w: 1, h: 0.4, dir: 'u' },
      { x: 0.5, y: 0.4, w: 0.5, h: 0.6, dir: 'r' },
    ],
    hub: [0.5, 0.4],
  },
  4: {
    seats: [
      { x: 0, y: 0.5, w: 0.5, h: 0.5, dir: 'l' },
      { x: 0, y: 0, w: 0.5, h: 0.5, dir: 'l' },
      { x: 0.5, y: 0, w: 0.5, h: 0.5, dir: 'r' },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5, dir: 'r' },
    ],
    hub: [0.5, 0.5],
  },
  5: {
    seats: [
      { x: 0, y: 0.65, w: 0.5, h: 0.35, dir: 'l' },
      { x: 0, y: 0.3, w: 0.5, h: 0.35, dir: 'l' },
      { x: 0, y: 0, w: 1, h: 0.3, dir: 'u' },
      { x: 0.5, y: 0.3, w: 0.5, h: 0.35, dir: 'r' },
      { x: 0.5, y: 0.65, w: 0.5, h: 0.35, dir: 'r' },
    ],
    hub: [0.5, 0.65],
  },
  6: {
    seats: [
      { x: 0, y: 2 * T, w: 0.5, h: T, dir: 'l' },
      { x: 0, y: T, w: 0.5, h: T, dir: 'l' },
      { x: 0, y: 0, w: 0.5, h: T, dir: 'l' },
      { x: 0.5, y: 0, w: 0.5, h: T, dir: 'r' },
      { x: 0.5, y: T, w: 0.5, h: T, dir: 'r' },
      { x: 0.5, y: 2 * T, w: 0.5, h: T, dir: 'r' },
    ],
    hub: [0.5, 0.5],
  },
};

/** Clockwise CSS rotation that makes content read upright for a player at that edge. */
export const ROTATION: Record<Dir, number> = { d: 0, u: 180, l: 90, r: -90 };

/** Default `?phone` preview size. */
export const PHONE_SIZE = { vw: 412, vh: 892 };

// ---- cell geometry (px) ----

/** Gap around each cell. */
export const CELL_GAP = 3;
export const NAME_H = 24;
export const BAR_MIN_H = 42;
export const BAR_MAX_H = 56;

export const TALLY_GAP = 5; // between opponents
export const TALLY_INNER = 2; // between partner squares
export const TALLY_PAD = 6;
export const TALLY_TOP = 4;
export const TALLY_MAX_COLS = 3;
export const TALLY_MIN_SQ = 16;
export const TALLY_MAX_SQ = 36;
/** Share of the cell width the tally may take. */
export const TALLY_MAX_SHARE = 0.4;

export const MANA_GAP = 6;
/** Height of a mana entry's count + symbol line. */
export const MANA_LABEL_H = 30;

// ---- timing ----

export const HOLD_MS = 450;
export const REPEAT_MS = 650;
/** Pointer travel (px) that turns a press into a swipe. */
export const MOVE_SLOP = 12;
export const SWIPE_MIN = 40;
export const HOLD_STEP = 10;

export const PRESENCE_MS = 220;
export const LIFE_DELTA_MS = 2000;
export const SEARCH_DEBOUNCE_MS = 300;
export const SPIN_MS = 2000;
export const DEFEAT_ROTATE_MS = 6000;

/**
 * Counter flash, in sequence with no overlap: the counter shows in place of the
 * life total, fades out (expo in, 30–60%), then the life total fades back (expo out, 60–100%).
 * The counter's half lives in the .flash CSS animation.
 */
export const FLASH_MS = 1200;
export const EXPO_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const FLASH_FRAMES: Keyframe[] = [{ opacity: 0 }, { opacity: 0, offset: 0.6, easing: EXPO_OUT }, { opacity: 1 }];

// ---- external ----

/** Scryfall API: https://scryfall.com/docs/api — keep requests spaced >= 100 ms. */
export const SCRYFALL_API = 'https://api.scryfall.com';
export const SCRYFALL_GAP_MS = 100;
export const SEARCH_MIN_CHARS = 2;
export const SEARCH_MAX_RESULTS = 10;
export const REPO_URL = 'https://github.com/Manwe-777/edh-hub';

// ---- defeat lines ----

export const DEFEAT_LINES = [
  'Phased out',
  'Mana screwed',
  'Annihilated',
  'No blockers',
  'Countered',
  'Exiled',
  'Board wiped',
  'Sacrificed',
  'Stuck on three lands',
  'Flooded out',
  'Tapped out',
  'Summoning sick',
  'Fizzled',
  'Bounced',
  'Topdecked a land',
  'Mulliganed to oblivion',
  'Wrathed',
  'Plowshared',
  'Cascaded into nothing',
  "Archenemy'd",
  'Kept a one-lander',
  'Left the battlefield',
  'Gone to the graveyard',
  'Removed from the game',
  "Didn't draw the combo",
  'Held up mana for nothing',
];

export const DEFEAT_LINES_BY_CAUSE: Record<LossCause, string[]> = {
  life: ['Bolted', 'Lethal on board', 'Drained out', 'Life total: no'],
  poison: ['Infected', 'Proliferated to death', 'Compleated'],
  cmd: ["Voltron'd", 'Commander says hi', 'Met the general', 'Suited up and smacked'],
};

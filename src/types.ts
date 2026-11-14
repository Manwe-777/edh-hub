/** Table edge a player sits at: down (bottom), up (top), left, right. */
export type Dir = 'd' | 'u' | 'l' | 'r';
export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

/** Numeric counters a player can track. `tax2` is the second commander's tax, shown with `tax` for partners. */
export type NumericCounter = 'poison' | 'experience' | 'energy' | 'rad' | 'tax' | 'tax2' | 'storm';
/** Single-holder tokens: only one player holds each at a time. */
export type TokenCounter = 'monarch' | 'initiative';
export type CounterKey = NumericCounter | TokenCounter;
/** A button in a cell's counter bar. */
export type BarItem = CounterKey | 'mana';

export interface Commander {
  name: string;
  art: string | null;
  artist: string | null;
}

/** A player as saved; the `Player` class adds the rules. */
export interface PlayerData {
  id: number;
  name: string;
  color: string;
  commanderCount: 1 | 2;
  commanders: [Commander, Commander];
  life: number;
  /** cmdDamage[sourceId] = [damage from source's commander 1, from commander 2] */
  cmdDamage: [number, number][];
  counters: Record<NumericCounter, number>;
  visibleCounters: CounterKey[];
  mana: Record<ManaColor, number>;
  manaOpen: boolean;
}

export interface Roll {
  /** Identifies this roll so the cells replay the spin once per roll. */
  id: number;
  /** rounds[r][playerId] = value rolled, or null if that player didn't roll that round */
  rounds: (number | null)[][];
  winner: number;
}

export type View = { kind: 'normal' } | { kind: 'cmd'; target: number };

/** A game as saved; the `Game` class adds the rules. */
export interface GameData {
  version: 1;
  playerCount: number;
  startingLife: number;
  keepAwake: boolean;
  /** Show a per-commander damage tally on the right edge of each cell. */
  cmdTally: boolean;
  /** Counters every player gets on "Reset players". */
  defaultCounters: CounterKey[];
  players: PlayerData[];
  monarch: number | null;
  initiative: number | null;
  view: View;
  roll: Roll | null;
  /** Bumped on resets so transient UI (life change bubbles) can clear. */
  epoch: number;
}

export type LossCause = 'life' | 'poison' | 'cmd';

/** A seat's cell as fractions of the portrait screen, and the table edge its player sits at. */
export interface Seat {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: Dir;
}

export interface Layout {
  seats: Seat[];
  /** Where the center menu button sits (fractions of the screen). */
  hub: [number, number];
}

export type SwipeDir = 'up' | 'down';

export interface PressOptions {
  onTap?: () => void;
  /** Fires once after HOLD_MS, then repeats every REPEAT_MS while held (if `repeat`). */
  onHold?: () => void;
  repeat?: boolean;
  /** Direction in the element's local (rotated) frame. */
  onSwipe?: (dir: SwipeDir) => void;
  /** Clockwise rotation (deg) applied to the element, to map screen motion into its frame. */
  rotation?: number;
}

/** Space above (name row) and below (counter bar) a cell's main area. */
export interface Pad {
  top: number;
  bottom: number;
}

/** One commander's damage to a player, as a square in the cell's tally. */
export interface TallySquare {
  key: string;
  color: string;
  art: string | null;
  dmg: number;
}

export interface TallyLayout {
  cols: number;
  size: number;
  tileW: number;
  width: number;
}

export interface ManaLayout {
  cols: number;
  rows: number;
  /** Entries laid out as − count + (true) or stacked + count − (false). */
  row: boolean;
  btn: number;
  slotW: number;
  slotH: number;
}

export interface ArtOption {
  key: string;
  art: string;
  artist: string;
  label: string;
}

export interface ScryfallCard {
  id: string;
  name: string;
  set_name: string;
  artist?: string;
  image_uris?: { art_crop: string };
  card_faces?: { name: string; artist?: string; image_uris?: { art_crop: string } }[];
}

export interface Viewport {
  vw: number;
  vh: number;
}

export interface CellGeometry {
  /** Cell box on screen. */
  box: { left: number; top: number; width: number; height: number };
  /** Cell size in the player's (rotated) frame. */
  lw: number;
  lh: number;
  barH: number;
  pad: Pad;
  lifeFont: number;
  tally: TallyLayout | null;
}

import type { Dir } from './game';

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

export const isSideways = (dir: Dir) => dir === 'l' || dir === 'r';

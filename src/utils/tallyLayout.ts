import {
  TALLY_GAP,
  TALLY_INNER,
  TALLY_MAX_COLS,
  TALLY_MAX_SHARE,
  TALLY_MAX_SQ,
  TALLY_MIN_SQ,
  TALLY_PAD,
} from '../constants';
import type { TallyLayout, TallySquare } from '../types';

/**
 * Opponents are tiles (a partner pair stays side by side in one tile) flowing
 * into 1–3 columns; picks the layout with the biggest squares that keeps the
 * strip within ~40% of the cell width.
 */
export function tallyLayout(groups: TallySquare[][], h: number, lw: number): TallyLayout {
  const n = groups.length;
  const slots = Math.max(...groups.map((g) => g.length));
  const maxW = lw * TALLY_MAX_SHARE;
  let best = { cols: 1, size: 0 };

  for (let cols = 1; cols <= TALLY_MAX_COLS; cols++) {
    const rows = Math.ceil(n / cols);
    const byH = (h - TALLY_GAP * (rows - 1)) / rows;
    const byW = (maxW - TALLY_PAD * 2 - (cols - 1) * TALLY_GAP - cols * (slots - 1) * TALLY_INNER) / (cols * slots);
    const size = Math.floor(Math.min(TALLY_MAX_SQ, byH, byW));
    if (size > best.size) best = { cols, size };
  }

  const size = Math.max(TALLY_MIN_SQ, best.size);
  const tileW = slots * size + (slots - 1) * TALLY_INNER;
  return { cols: best.cols, size, tileW, width: best.cols * tileW + (best.cols - 1) * TALLY_GAP + TALLY_PAD * 2 };
}

import { MANA_GAP, MANA_LABEL_H } from '../constants';
import type { ManaLayout } from '../types';

/** Grid shape and sizes for `n` mana entries in a w×h box; picks whichever gives the largest buttons. */
export function manaLayout(n: number, w: number, h: number): ManaLayout {
  const g = MANA_GAP;
  const label = MANA_LABEL_H;
  const shapes = [
    { cols: n, rows: 1, row: false },
    { cols: Math.ceil(n / 2), rows: 2, row: false },
    { cols: 2, rows: Math.ceil(n / 2), row: true },
    { cols: Math.ceil(n / 2), rows: 2, row: true },
  ].map((o) => {
    const colW = (w - g * (o.cols - 1)) / o.cols;
    const rowH = (h - g * (o.rows - 1)) / o.rows;
    // vertical entry: + above, label, − below; row entry: − label +
    const btn = o.row ? Math.min((colW - 64) / 2, rowH) : Math.min(colW, (rowH - label - 4) / 2);
    return { ...o, btn };
  });
  const best = shapes.reduce((a, b) => (b.btn > a.btn ? b : a));
  const btn = Math.floor(Math.max(28, Math.min(56, best.btn)));
  // Each entry only takes the room it needs, so the group stays together in big cells.
  const slotW = Math.floor(
    Math.min((w - g * (best.cols - 1)) / best.cols, best.row ? 2 * btn + 84 : Math.max(btn, 56) + 24),
  );
  const slotH = Math.min((h - g * (best.rows - 1)) / best.rows, best.row ? btn + 20 : 2 * btn + label + 16);
  return { ...best, btn, slotW, slotH };
}

import { describe, expect, it } from 'vitest';

import { LAYOUTS, TALLY_MAX_SHARE, TALLY_MAX_SQ, TALLY_MIN_SQ } from '../constants';
import type { TallySquare } from '../types';
import { cellGeometry } from './cellGeometry';
import { manaLayout } from './manaLayout';
import { tallyLayout } from './tallyLayout';

const sq = (dmg = 3): TallySquare => ({ key: String(Math.random()), color: '#fff', art: null, dmg });

describe('tallyLayout', () => {
  it('uses one column of big squares when there is room', () => {
    const l = tallyLayout([[sq()], [sq()]], 300, 400);
    expect(l.cols).toBe(1);
    expect(l.size).toBe(TALLY_MAX_SQ);
  });

  it('keeps partner squares together and stays within its share of the cell', () => {
    const groups = [[sq(), sq()], [sq()], [sq(), sq()], [sq()], [sq()]];
    const l = tallyLayout(groups, 120, 200);
    expect(l.tileW).toBeGreaterThanOrEqual(2 * l.size);
    expect(l.width).toBeLessThanOrEqual(200 * TALLY_MAX_SHARE + 0.5);
    expect(l.cols * Math.floor(120 / l.size)).toBeGreaterThanOrEqual(groups.length);
  });

  it('never shrinks squares below the minimum', () => {
    const l = tallyLayout(
      Array.from({ length: 5 }, () => [sq(), sq()]),
      20,
      60,
    );
    expect(l.size).toBe(TALLY_MIN_SQ);
  });
});

describe('manaLayout', () => {
  it('fits five entries inside the box', () => {
    for (const [w, h] of [
      [380, 150],
      [180, 300],
      [400, 600],
    ]) {
      const l = manaLayout(5, w, h);
      expect(l.cols * l.rows).toBeGreaterThanOrEqual(5);
      expect(l.cols * l.slotW + (l.cols - 1) * 6).toBeLessThanOrEqual(w);
      expect(l.rows * l.slotH + (l.rows - 1) * 6).toBeLessThanOrEqual(h + 0.5);
    }
  });

  it('keeps buttons between 28 and 56 px however big or small the cell is', () => {
    expect(manaLayout(5, 2000, 2000).btn).toBe(56);
    expect(manaLayout(5, 100, 60).btn).toBe(28);
  });
});

describe('cellGeometry', () => {
  const vp = { vw: 400, vh: 800 };
  const seat = LAYOUTS[4].seats[0];

  it('places the cell inside its seat with a gap', () => {
    const g = cellGeometry(seat, vp, true, []);
    expect(g.box).toEqual({ left: 3, top: 403, width: 194, height: 394 });
    // Side seat: the player's frame is rotated.
    expect(g.lw).toBe(394);
    expect(g.lh).toBe(194);
  });

  it('hides the counter bar when asked', () => {
    expect(cellGeometry(seat, vp, false, []).barH).toBe(0);
    expect(cellGeometry(seat, vp, true, []).barH).toBeGreaterThan(0);
  });

  it('makes room for the tally and shrinks the life total to fit', () => {
    const plain = cellGeometry(seat, vp, true, []);
    const withTally = cellGeometry(seat, vp, true, [[sq()], [sq()], [sq()]]);
    expect(withTally.tally?.width).toBeGreaterThan(0);
    expect(withTally.lifeFont).toBeLessThanOrEqual(plain.lifeFont);
  });
});

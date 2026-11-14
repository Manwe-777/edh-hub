import { CELL_GAP, NAME_H, TALLY_TOP } from '../constants';
import type { CellGeometry, Seat, TallySquare, Viewport } from '../types';
import { counterBarHeight } from './counterBarHeight';
import { lifeFontSize } from './lifeFontSize';
import { localSize } from './localSize';
import { tallyLayout } from './tallyLayout';

/**
 * Sizes for one cell. The counter bar is hidden in the commander damage view;
 * a damage tally takes room on the right and the life total shrinks to fit beside it.
 */
export function cellGeometry(seat: Seat, { vw, vh }: Viewport, showBar: boolean, tally: TallySquare[][]): CellGeometry {
  const width = seat.w * vw - CELL_GAP * 2;
  const height = seat.h * vh - CELL_GAP * 2;
  const { lw, lh } = localSize(width, height, seat.dir);
  const barH = showBar ? counterBarHeight(lh) : 0;
  // The tally strip also uses the name row (the name re-centers in the space left of it).
  const tallyBox = tally.length ? tallyLayout(tally, lh - barH - TALLY_TOP - 4, lw) : null;
  return {
    box: { left: seat.x * vw + CELL_GAP, top: seat.y * vh + CELL_GAP, width, height },
    lw,
    lh,
    barH,
    pad: { top: NAME_H, bottom: barH },
    lifeFont: lifeFontSize(lw - (tallyBox?.width ?? 0), lh - barH - NAME_H),
    tally: tallyBox,
  };
}

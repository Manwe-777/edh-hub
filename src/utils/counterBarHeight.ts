import { BAR_MAX_H, BAR_MIN_H } from '../constants';

/** Counter bar height for a cell `lh` tall (local frame). */
export function counterBarHeight(lh: number): number {
  return Math.round(Math.max(BAR_MIN_H, Math.min(BAR_MAX_H, lh * 0.2)));
}

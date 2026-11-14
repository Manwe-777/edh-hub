import type { Dir } from '../types';
import { isSideways } from './isSideways';

/** Local (rotated) width/height of a w×h box. */
export function localSize(w: number, h: number, dir: Dir): { lw: number; lh: number } {
  return isSideways(dir) ? { lw: h, lh: w } : { lw: w, lh: h };
}

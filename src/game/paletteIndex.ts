import { OLD_PALETTES } from '../constants';

/** Index of a color in any earlier palette, or -1. */
export function paletteIndex(color: string): number {
  return Math.max(...OLD_PALETTES.map((pal) => pal.indexOf(color)));
}

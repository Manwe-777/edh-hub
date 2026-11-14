/** Life total font size that fits a w×h area. */
export function lifeFontSize(w: number, h: number): number {
  return Math.max(28, Math.min(w * 0.28, h * 0.66));
}

/** A signed life change: "+3", "−2" (with a real minus sign). */
export function formatDelta(n: number): string {
  return n > 0 ? `+${n}` : `−${-n}`;
}

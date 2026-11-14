import { rollDie } from './rollDie';

/** A shuffled copy (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const r = [...items];

  for (let i = r.length - 1; i > 0; i--) {
    const j = rollDie(i + 1) - 1;
    [r[i], r[j]] = [r[j], r[i]];
  }

  return r;
}

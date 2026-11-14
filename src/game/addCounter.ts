import type { Game, NumericCounter } from '../types';

export function addCounter(g: Game, id: number, key: NumericCounter, delta: number) {
  const c = g.players[id].counters;
  c[key] = Math.max(0, c[key] + delta);
}

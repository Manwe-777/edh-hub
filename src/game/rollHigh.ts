import { MAX_PLAYERS, ROLL_DIE } from '../constants';
import type { Game } from '../types';
import { rollDie } from '../utils/rollDie';

/** Everyone rolls a d20; ties re-roll among the tied players until one is highest. */
export function rollHigh(g: Game) {
  let contenders = Array.from({ length: g.playerCount }, (_, i) => i);
  const rounds: (number | null)[][] = [];
  for (;;) {
    const r: (number | null)[] = Array(MAX_PLAYERS).fill(null);
    for (const i of contenders) r[i] = rollDie(ROLL_DIE);
    rounds.push(r);
    const max = Math.max(...contenders.map((i) => r[i]!));
    const tops = contenders.filter((i) => r[i] === max);
    if (tops.length === 1) {
      g.roll = { id: Date.now(), rounds, winner: tops[0] };
      return;
    }
    contenders = tops;
  }
}

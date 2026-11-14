import { describe, expect, it, vi } from 'vitest';

import { newGame } from './newGame';
import { rollHigh } from './rollHigh';

describe('rollHigh', () => {
  /** Makes crypto.getRandomValues return the given d20 faces in order. */
  function rigDice(faces: number[]) {
    let i = 0;
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((a) => {
      (a as Uint32Array)[0] = faces[i++] - 1;
      return a;
    });
  }

  it('the highest roll wins', () => {
    const g = newGame();
    rigDice([5, 17, 3, 9]);
    rollHigh(g);
    expect(g.roll?.winner).toBe(1);
    expect(g.roll?.rounds).toHaveLength(1);
  });

  it('only tied players re-roll, until one is highest', () => {
    const g = newGame();
    rigDice([20, 4, 20, 2, /* re-roll */ 8, 8, /* again */ 3, 11]);
    rollHigh(g);
    const rounds = g.roll!.rounds;
    expect(rounds).toHaveLength(3);
    expect(rounds[1]).toEqual([8, null, 8, null, null, null]);
    expect(rounds[2]).toEqual([3, null, 11, null, null, null]);
    expect(g.roll?.winner).toBe(2);
  });

  it('only active players roll', () => {
    const g = newGame();
    g.playerCount = 2;
    rollHigh(g);
    expect(g.roll!.rounds[0].slice(2).every((v) => v === null)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { lossCause } from './lossCause';
import { newGame } from './newGame';

describe('lossCause', () => {
  it('is null for a healthy player', () => {
    const g = newGame();
    expect(lossCause(g, g.players[0])).toBeNull();
  });

  it('reports life, poison and commander damage', () => {
    const g = newGame();
    g.players[0].life = 0;
    expect(lossCause(g, g.players[0])).toBe('life');
    g.players[1].counters.poison = 10;
    expect(lossCause(g, g.players[1])).toBe('poison');
    g.players[2].cmdDamage[3][0] = 21;
    expect(lossCause(g, g.players[2])).toBe('cmd');
  });

  it("counts a second commander's damage only for partners", () => {
    const g = newGame();
    g.players[0].cmdDamage[1][1] = 21;
    expect(lossCause(g, g.players[0])).toBeNull();
    g.players[1].commanderCount = 2;
    expect(lossCause(g, g.players[0])).toBe('cmd');
  });

  it('ignores damage from seats that are not playing', () => {
    const g = newGame();
    g.playerCount = 3;
    g.players[0].cmdDamage[4][0] = 25;
    expect(lossCause(g, g.players[0])).toBeNull();
  });
});

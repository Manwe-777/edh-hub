import { describe, expect, it } from 'vitest';

import { addCmdDamage } from './addCmdDamage';
import { addCounter } from './addCounter';
import { addLife } from './addLife';
import { addMana } from './addMana';
import { newGame } from './newGame';

describe('life and commander damage', () => {
  it('commander damage takes life, and removing it gives the life back', () => {
    const g = newGame();
    addCmdDamage(g, 0, 1, 0, 7);
    expect(g.players[0].cmdDamage[1][0]).toBe(7);
    expect(g.players[0].life).toBe(33);
    addCmdDamage(g, 0, 1, 0, -3);
    expect(g.players[0].cmdDamage[1][0]).toBe(4);
    expect(g.players[0].life).toBe(36);
  });

  it('removing more damage than was dealt only gives back what was dealt', () => {
    const g = newGame();
    addCmdDamage(g, 0, 1, 1, 2);
    addCmdDamage(g, 0, 1, 1, -10);
    expect(g.players[0].cmdDamage[1][1]).toBe(0);
    expect(g.players[0].life).toBe(40);
  });

  it('life can go negative', () => {
    const g = newGame();
    addLife(g, 2, -45);
    expect(g.players[2].life).toBe(-5);
  });

  it('counters and mana never go below zero', () => {
    const g = newGame();
    addCounter(g, 0, 'poison', -1);
    addCounter(g, 0, 'storm', 3);
    addMana(g, 0, 'G', -2);
    addMana(g, 0, 'U', 4);
    expect(g.players[0].counters.poison).toBe(0);
    expect(g.players[0].counters.storm).toBe(3);
    expect(g.players[0].mana.G).toBe(0);
    expect(g.players[0].mana.U).toBe(4);
  });
});

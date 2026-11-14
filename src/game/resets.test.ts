import { describe, expect, it } from 'vitest';

import { DEFAULT_COUNTERS, PALETTE } from '../constants';
import { addCmdDamage } from './addCmdDamage';
import { addCounter } from './addCounter';
import { addMana } from './addMana';
import { newGame } from './newGame';
import { resetGame } from './resetGame';
import { resetPlayers } from './resetPlayers';

describe('Reset all and Reset players', () => {
  it('Reset all keeps names, colors and commanders but clears the game', () => {
    const g = newGame();
    g.startingLife = 30;
    g.players[0].name = 'Ana';
    g.players[0].commanders[0] = { name: 'Atraxa', art: 'a.jpg', artist: 'x' };
    addCmdDamage(g, 0, 1, 0, 5);
    addCounter(g, 0, 'poison', 2);
    addMana(g, 0, 'W', 1);
    g.players[0].manaOpen = true;
    g.monarch = 1;
    g.view = { kind: 'cmd', target: 0 };
    const epoch = g.epoch;

    resetGame(g);

    const p = g.players[0];
    expect(p.name).toBe('Ana');
    expect(p.commanders[0].name).toBe('Atraxa');
    expect(p.life).toBe(30);
    expect(p.cmdDamage[1]).toEqual([0, 0]);
    expect(p.counters.poison).toBe(0);
    expect(p.mana.W).toBe(0);
    expect(p.manaOpen).toBe(false);
    expect(g.monarch).toBeNull();
    expect(g.view).toEqual({ kind: 'normal' });
    expect(g.epoch).toBe(epoch + 1);
  });

  it('Reset players gives every seat distinct colors, one commander and the default counters', () => {
    const g = newGame();
    g.defaultCounters = ['energy', 'rad'];
    g.players[0].name = 'Ana';
    g.players[0].commanderCount = 2;
    g.players[0].commanders[0] = { name: 'Atraxa', art: 'a.jpg', artist: 'x' };

    resetPlayers(g);

    expect(new Set(g.players.map((p) => p.color)).size).toBe(g.players.length);

    for (const p of g.players) {
      expect(PALETTE).toContain(p.color);
      expect(p.commanderCount).toBe(1);
      expect(p.commanders[0].name).toBe('');
      expect(p.visibleCounters).toEqual(['energy', 'rad']);
    }

    expect(g.players[0].name).toBe('Player 1');
  });

  it("Reset players doesn't share the defaults list with the players", () => {
    const g = newGame();
    resetPlayers(g);
    g.players[0].visibleCounters.push('rad');
    expect(g.defaultCounters).toEqual(DEFAULT_COUNTERS);
  });
});

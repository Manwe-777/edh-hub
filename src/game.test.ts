import { describe, expect, it, vi } from 'vitest';

import {
  addCmdDamage,
  addCounter,
  addLife,
  addMana,
  DEFAULT_COUNTERS,
  lossCause,
  MAX_VISIBLE_COUNTERS,
  migrate,
  newGame,
  PALETTE,
  resetGame,
  resetPlayers,
  rollHigh,
  toggleCounter,
} from './game';

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

describe('resets', () => {
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

describe('toggleCounter', () => {
  it('adds and removes a counter', () => {
    const list = ['tax' as const] as Parameters<typeof toggleCounter>[0];
    toggleCounter(list, 'storm');
    expect(list).toEqual(['tax', 'storm']);
    toggleCounter(list, 'tax');
    expect(list).toEqual(['storm']);
  });

  it('stops adding at the limit', () => {
    const list: Parameters<typeof toggleCounter>[0] = ['tax', 'storm', 'poison', 'energy', 'rad'];
    expect(list).toHaveLength(MAX_VISIBLE_COUNTERS);
    toggleCounter(list, 'monarch');
    expect(list).not.toContain('monarch');
  });
});

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

describe('migrate', () => {
  it('rejects saves it cannot read', () => {
    expect(() => migrate(null)).toThrow();
    expect(() => migrate({ version: 2, players: [] })).toThrow();
    expect(() => migrate({ version: 1, players: [] })).toThrow();
  });

  it('round-trips a current game', () => {
    const g = newGame();
    g.players[3].life = 12;
    expect(migrate(JSON.parse(JSON.stringify(g)))).toEqual(g);
  });

  it('fills fields added after the save was written', () => {
    const g = newGame() as unknown as Record<string, unknown>;
    delete g.cmdTally;
    delete g.defaultCounters;
    const players = g.players as Record<string, unknown>[];
    delete players[0].commanderCount;
    delete (players[0].counters as Record<string, unknown>).tax2;
    const out = migrate(g);
    expect(out.cmdTally).toBe(false);
    expect(out.defaultCounters).toEqual(DEFAULT_COUNTERS);
    expect(out.players[0].commanderCount).toBe(1);
    expect(out.players[0].counters.tax2).toBe(0);
  });

  it('maps colors from the old palettes onto the current one', () => {
    const g = newGame();
    g.players[0].color = '#b8423a'; // first palette, index 1
    g.players[1].color = '#8fd9a8'; // pastel palette, index 2
    g.players[2].color = '#123456'; // custom, kept
    const out = migrate(g);
    expect(out.players[0].color).toBe(PALETTE[1]);
    expect(out.players[1].color).toBe(PALETTE[2]);
    expect(out.players[2].color).toBe('#123456');
  });

  it('falls back to 4 players when the count is out of range', () => {
    const g = newGame();
    g.playerCount = 9;
    expect(migrate(g).playerCount).toBe(4);
  });
});

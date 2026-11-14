import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_COUNTERS, PALETTE } from '../constants';
import { Game } from './Game';

describe('life and commander damage', () => {
  it('commander damage takes life, and removing it gives the life back', () => {
    const g = new Game();
    g.addCmdDamage(0, 1, 0, 7);
    expect(g.players[0].cmdDamage[1][0]).toBe(7);
    expect(g.players[0].life).toBe(33);
    g.addCmdDamage(0, 1, 0, -3);
    expect(g.players[0].cmdDamage[1][0]).toBe(4);
    expect(g.players[0].life).toBe(36);
  });

  it('removing more damage than was dealt only gives back what was dealt', () => {
    const g = new Game();
    g.addCmdDamage(0, 1, 1, 2);
    g.addCmdDamage(0, 1, 1, -10);
    expect(g.players[0].cmdDamage[1][1]).toBe(0);
    expect(g.players[0].life).toBe(40);
  });

  it('life can go negative', () => {
    const g = new Game();
    g.addLife(2, -45);
    expect(g.players[2].life).toBe(-5);
  });

  it('counters and mana never go below zero', () => {
    const g = new Game();
    g.addCounter(0, 'poison', -1);
    g.addCounter(0, 'storm', 3);
    g.addMana(0, 'G', -2);
    g.addMana(0, 'U', 4);
    expect(g.players[0].counters.poison).toBe(0);
    expect(g.players[0].counters.storm).toBe(3);
    expect(g.players[0].mana.G).toBe(0);
    expect(g.players[0].mana.U).toBe(4);
  });
});

describe('lossCause', () => {
  it('is null for a healthy player', () => {
    const g = new Game();
    expect(g.lossCause(g.players[0])).toBeNull();
  });

  it('reports life, poison and commander damage', () => {
    const g = new Game();
    g.players[0].life = 0;
    expect(g.lossCause(g.players[0])).toBe('life');
    g.players[1].counters.poison = 10;
    expect(g.lossCause(g.players[1])).toBe('poison');
    g.players[2].cmdDamage[3][0] = 21;
    expect(g.lossCause(g.players[2])).toBe('cmd');
  });

  it("counts a second commander's damage only for partners", () => {
    const g = new Game();
    g.players[0].cmdDamage[1][1] = 21;
    expect(g.lossCause(g.players[0])).toBeNull();
    g.players[1].commanderCount = 2;
    expect(g.lossCause(g.players[0])).toBe('cmd');
  });

  it('ignores damage from seats that are not playing', () => {
    const g = new Game();
    g.playerCount = 3;
    g.players[0].cmdDamage[4][0] = 25;
    expect(g.lossCause(g.players[0])).toBeNull();
  });
});

describe('Reset all and Reset players', () => {
  it('Reset all keeps names, colors and commanders but clears the game', () => {
    const g = new Game();
    g.startingLife = 30;
    g.players[0].name = 'Ana';
    g.players[0].commanders[0] = { name: 'Atraxa', art: 'a.jpg', artist: 'x' };
    g.addCmdDamage(0, 1, 0, 5);
    g.addCounter(0, 'poison', 2);
    g.addMana(0, 'W', 1);
    g.players[0].manaOpen = true;
    g.monarch = 1;
    g.view = { kind: 'cmd', target: 0 };
    const epoch = g.epoch;

    g.reset();

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
    const g = new Game();
    g.defaultCounters = ['energy', 'rad'];
    g.players[0].name = 'Ana';
    g.players[0].commanderCount = 2;
    g.players[0].commanders[0] = { name: 'Atraxa', art: 'a.jpg', artist: 'x' };

    g.resetPlayers();

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
    const g = new Game();
    g.resetPlayers();
    g.players[0].visibleCounters.push('rad');
    expect(g.defaultCounters).toEqual(DEFAULT_COUNTERS);
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
    const g = new Game();
    rigDice([5, 17, 3, 9]);
    g.rollHigh();
    expect(g.roll?.winner).toBe(1);
    expect(g.roll?.rounds).toHaveLength(1);
  });

  it('only tied players re-roll, until one is highest', () => {
    const g = new Game();
    rigDice([20, 4, 20, 2, /* re-roll */ 8, 8, /* again */ 3, 11]);
    g.rollHigh();
    const rounds = g.roll!.rounds;
    expect(rounds).toHaveLength(3);
    expect(rounds[1]).toEqual([8, null, 8, null, null, null]);
    expect(rounds[2]).toEqual([3, null, 11, null, null, null]);
    expect(g.roll?.winner).toBe(2);
  });

  it('only active players roll', () => {
    const g = new Game();
    g.playerCount = 2;
    g.rollHigh();
    expect(g.roll!.rounds[0].slice(2).every((v) => v === null)).toBe(true);
  });
});

describe('migrate', () => {
  it('rejects saves it cannot read', () => {
    expect(() => Game.fromSave(null)).toThrow();
    expect(() => Game.fromSave({ version: 2, players: [] })).toThrow();
    expect(() => Game.fromSave({ version: 1, players: [] })).toThrow();
  });

  it('round-trips a current game', () => {
    const g = new Game();
    g.players[3].life = 12;
    expect(Game.fromSave(JSON.parse(JSON.stringify(g)))).toEqual(g);
  });

  it('fills fields added after the save was written', () => {
    const g = new Game() as unknown as Record<string, unknown>;
    delete g.cmdTally;
    delete g.defaultCounters;
    const players = g.players as Record<string, unknown>[];
    delete players[0].commanderCount;
    delete (players[0].counters as Record<string, unknown>).tax2;
    const out = Game.fromSave(g);
    expect(out.cmdTally).toBe(false);
    expect(out.defaultCounters).toEqual(DEFAULT_COUNTERS);
    expect(out.players[0].commanderCount).toBe(1);
    expect(out.players[0].counters.tax2).toBe(0);
  });

  it('maps colors from the old palettes onto the current one', () => {
    const g = new Game();
    g.players[0].color = '#b8423a'; // first palette, index 1
    g.players[1].color = '#8fd9a8'; // pastel palette, index 2
    g.players[2].color = '#123456'; // custom, kept
    const out = Game.fromSave(g);
    expect(out.players[0].color).toBe(PALETTE[1]);
    expect(out.players[1].color).toBe(PALETTE[2]);
    expect(out.players[2].color).toBe('#123456');
  });

  it('falls back to 4 players when the count is out of range', () => {
    const g = new Game();
    g.playerCount = 9;
    expect(Game.fromSave(g).playerCount).toBe(4);
  });
});

describe('tallySources', () => {
  it('lists only commanders that dealt damage, grouping partners by opponent', () => {
    const g = new Game();
    g.players[1].commanderCount = 2;
    g.players[0].cmdDamage[1] = [4, 2];
    g.players[0].cmdDamage[3] = [6, 0];
    const groups = g.tallySources(g.players[0]);
    expect(groups.map((gr) => gr.map((s) => s.dmg))).toEqual([[4, 2], [6]]);
    expect(groups[0][0].color).toBe(g.players[1].color);
  });

  it("ignores a single commander player's unused second slot and seats not playing", () => {
    const g = new Game();
    g.playerCount = 3;
    g.players[0].cmdDamage[1] = [0, 9];
    g.players[0].cmdDamage[4] = [9, 0];
    expect(g.tallySources(g.players[0])).toEqual([]);
  });

  it('uses commander art when there is some', () => {
    const g = new Game();
    g.players[2].commanders[0] = { name: 'X', art: 'x.jpg', artist: null };
    g.players[0].cmdDamage[2] = [1, 0];
    expect(g.tallySources(g.players[0])[0][0].art).toBe('x.jpg');
  });
});

describe('monarch and initiative', () => {
  it('can be taken from another player and only given up by its holder', () => {
    const g = new Game();
    g.claimToken('monarch', 1);
    g.claimToken('monarch', 2);
    expect(g.monarch).toBe(2);
    g.dropToken('monarch', 1);
    expect(g.monarch).toBe(2);
    g.dropToken('monarch', 2);
    expect(g.monarch).toBeNull();
  });
});

describe('cellView', () => {
  it('marks the damage target and hides the mana pool and tally under a view', () => {
    const g = new Game();
    g.cmdTally = true;
    g.players[0].manaOpen = true;
    g.players[0].cmdDamage[1] = [2, 0];
    expect(g.cellView(g.players[0])).toMatchObject({ inCmd: false, manaShown: true });
    expect(g.cellView(g.players[0]).tally).toHaveLength(1);

    g.view = { kind: 'cmd', target: 0 };
    expect(g.cellView(g.players[0])).toEqual({ inCmd: true, isTarget: true, manaShown: false, tally: [] });
    expect(g.cellView(g.players[1]).isTarget).toBe(false);
  });

  it('shows no tally when the setting is off', () => {
    const g = new Game();
    g.players[0].cmdDamage[1] = [2, 0];
    expect(g.cellView(g.players[0]).tally).toEqual([]);
  });
});

describe('copies and saves', () => {
  it('a clone is independent of the original', () => {
    const g = new Game();
    const c = g.clone();
    c.addCmdDamage(0, 1, 0, 5);
    c.players[0].name = 'Ana';
    expect(g.players[0].life).toBe(40);
    expect(g.players[0].cmdDamage[1]).toEqual([0, 0]);
    expect(g.players[0].name).toBe('Player 1');
    expect(c).toBeInstanceOf(Game);
  });

  it('saves as plain data and loads back with its rules', () => {
    const g = new Game();
    g.addCounter(2, 'poison', 10);
    const saved = JSON.parse(JSON.stringify(g));
    expect(Object.getPrototypeOf(saved)).toBe(Object.prototype);
    const loaded = Game.fromSave(saved);
    expect(loaded.lossCause(loaded.players[2])).toBe('poison');
    loaded.players[2].addCounter('poison', -1);
    expect(loaded.lossCause(loaded.players[2])).toBeNull();
  });
});

describe('views', () => {
  it('lowering the player count leaves a damage view on a seat that is gone', () => {
    const g = new Game();
    g.showDamageTo(4);
    g.rollHigh();
    g.setPlayerCount(5);
    expect(g.view).toEqual({ kind: 'cmd', target: 4 });
    expect(g.roll).toBeNull();
    g.setPlayerCount(3);
    expect(g.view).toEqual({ kind: 'normal' });
  });

  it('going back to the table closes the damage view and the roll', () => {
    const g = new Game();
    g.showDamageTo(1);
    g.rollHigh();
    g.showTable();
    expect(g.view).toEqual({ kind: 'normal' });
    expect(g.roll).toBeNull();
  });
});

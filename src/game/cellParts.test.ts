import { describe, expect, it } from 'vitest';

import { addMana } from './addMana';
import { cellView } from './cellView';
import { claimToken } from './claimToken';
import { clearMana } from './clearMana';
import { commanderArts } from './commanderArts';
import { counterBarItems } from './counterBarItems';
import { dropToken } from './dropToken';
import { newGame } from './newGame';
import { poolTotal } from './poolTotal';
import { tallySources } from './tallySources';

describe('tallySources', () => {
  it('lists only commanders that dealt damage, grouping partners by opponent', () => {
    const g = newGame();
    g.players[1].commanderCount = 2;
    g.players[0].cmdDamage[1] = [4, 2];
    g.players[0].cmdDamage[3] = [6, 0];
    const groups = tallySources(g, g.players[0]);
    expect(groups.map((gr) => gr.map((s) => s.dmg))).toEqual([[4, 2], [6]]);
    expect(groups[0][0].color).toBe(g.players[1].color);
  });

  it("ignores a single commander player's unused second slot and seats not playing", () => {
    const g = newGame();
    g.playerCount = 3;
    g.players[0].cmdDamage[1] = [0, 9];
    g.players[0].cmdDamage[4] = [9, 0];
    expect(tallySources(g, g.players[0])).toEqual([]);
  });

  it('uses commander art when there is some', () => {
    const g = newGame();
    g.players[2].commanders[0] = { name: 'X', art: 'x.jpg', artist: null };
    g.players[0].cmdDamage[2] = [1, 0];
    expect(tallySources(g, g.players[0])[0][0].art).toBe('x.jpg');
  });
});

describe('counterBarItems', () => {
  it('ends with the mana pool', () => {
    const g = newGame();
    expect(counterBarItems(g.players[0])).toEqual(['tax', 'storm', 'poison', 'mana']);
  });

  it('gives partners a second tax button right after the first', () => {
    const g = newGame();
    g.players[0].commanderCount = 2;
    expect(counterBarItems(g.players[0])).toEqual(['tax', 'tax2', 'storm', 'poison', 'mana']);
  });
});

describe('commanderArts', () => {
  it('returns the art of commanders in play only', () => {
    const p = newGame().players[0];

    p.commanders = [
      { name: 'A', art: 'a.jpg', artist: null },
      { name: 'B', art: 'b.jpg', artist: null },
    ];

    expect(commanderArts(p)).toEqual(['a.jpg']);
    p.commanderCount = 2;
    expect(commanderArts(p)).toEqual(['a.jpg', 'b.jpg']);
    p.commanders[0].art = null;
    expect(commanderArts(p)).toEqual(['b.jpg']);
  });
});

describe('mana pool', () => {
  it('totals the five colors and empties the pool', () => {
    const g = newGame();
    addMana(g, 0, 'W', 2);
    addMana(g, 0, 'G', 3);
    expect(poolTotal(g.players[0])).toBe(5);
    clearMana(g, 0);
    expect(poolTotal(g.players[0])).toBe(0);
  });
});

describe('monarch and initiative', () => {
  it('can be taken from another player and only given up by its holder', () => {
    const g = newGame();
    claimToken(g, 'monarch', 1);
    claimToken(g, 'monarch', 2);
    expect(g.monarch).toBe(2);
    dropToken(g, 'monarch', 1);
    expect(g.monarch).toBe(2);
    dropToken(g, 'monarch', 2);
    expect(g.monarch).toBeNull();
  });
});

describe('cellView', () => {
  it('marks the damage target and hides the mana pool and tally under a view', () => {
    const g = newGame();
    g.cmdTally = true;
    g.players[0].manaOpen = true;
    g.players[0].cmdDamage[1] = [2, 0];
    expect(cellView(g, g.players[0])).toMatchObject({ inCmd: false, manaShown: true });
    expect(cellView(g, g.players[0]).tally).toHaveLength(1);

    g.view = { kind: 'cmd', target: 0 };
    expect(cellView(g, g.players[0])).toEqual({ inCmd: true, isTarget: true, manaShown: false, tally: [] });
    expect(cellView(g, g.players[1]).isTarget).toBe(false);
  });

  it('shows no tally when the setting is off', () => {
    const g = newGame();
    g.players[0].cmdDamage[1] = [2, 0];
    expect(cellView(g, g.players[0]).tally).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';

import { Game } from './Game';

describe('counterBarItems', () => {
  it('ends with the mana pool', () => {
    const g = new Game();
    expect(g.players[0].barItems).toEqual(['tax', 'storm', 'poison', 'mana']);
  });

  it('gives partners a second tax button right after the first', () => {
    const g = new Game();
    g.players[0].commanderCount = 2;
    expect(g.players[0].barItems).toEqual(['tax', 'tax2', 'storm', 'poison', 'mana']);
  });
});

describe('commanderArts', () => {
  it('returns the art of commanders in play only', () => {
    const p = new Game().players[0];

    p.commanders = [
      { name: 'A', art: 'a.jpg', artist: null },
      { name: 'B', art: 'b.jpg', artist: null },
    ];

    expect(p.arts).toEqual(['a.jpg']);
    p.commanderCount = 2;
    expect(p.arts).toEqual(['a.jpg', 'b.jpg']);
    p.commanders[0].art = null;
    expect(p.arts).toEqual(['b.jpg']);
  });
});

describe('mana pool', () => {
  it('totals the five colors and empties the pool', () => {
    const g = new Game();
    g.addMana(0, 'W', 2);
    g.addMana(0, 'G', 3);
    expect(g.players[0].poolTotal).toBe(5);
    g.players[0].clearMana();
    expect(g.players[0].poolTotal).toBe(0);
  });
});

describe('commanders', () => {
  it('sets and clears a commander slot', () => {
    const p = new Game().players[0];
    p.setCommander(1, { name: 'Tymna', art: 't.jpg', artist: 'x' });
    expect(p.commanders[1].name).toBe('Tymna');
    p.clearCommander(1);
    expect(p.commanders[1]).toEqual({ name: '', art: null, artist: null });
  });
});

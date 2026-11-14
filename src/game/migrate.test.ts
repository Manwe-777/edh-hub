import { describe, expect, it } from 'vitest';

import { DEFAULT_COUNTERS, PALETTE } from '../constants';
import { migrate } from './migrate';
import { newGame } from './newGame';

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

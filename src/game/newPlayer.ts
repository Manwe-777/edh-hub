import { DEFAULT_COUNTERS, PALETTE } from '../constants';
import type { Player } from '../types';
import { emptyCommander } from './emptyCommander';
import { zeroCounters } from './zeroCounters';
import { zeroDamage } from './zeroDamage';
import { zeroMana } from './zeroMana';

export function newPlayer(id: number, life: number): Player {
  return {
    id,
    name: `Player ${id + 1}`,
    color: PALETTE[id % PALETTE.length],
    commanderCount: 1,
    commanders: [emptyCommander(), emptyCommander()],
    life,
    cmdDamage: zeroDamage(),
    counters: zeroCounters(),
    visibleCounters: [...DEFAULT_COUNTERS],
    mana: zeroMana(),
    manaOpen: false,
  };
}

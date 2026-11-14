import { MAX_PLAYERS, PALETTE } from '../constants';
import type { Player } from '../types';
import { newPlayer } from './newPlayer';
import { paletteIndex } from './paletteIndex';

/** A saved player with fields added since filled in and old palette colors mapped to the current ones. */
export function migratePlayer(p: Player, i: number, startingLife: number): Player {
  const np = newPlayer(i, startingLife);
  const old = paletteIndex(p.color);
  return {
    ...np,
    ...p,
    color: old >= 0 ? PALETTE[old] : p.color,
    counters: { ...np.counters, ...(p.counters ?? {}) },
    mana: { ...np.mana, ...(p.mana ?? {}) },
    cmdDamage: Array.isArray(p.cmdDamage) && p.cmdDamage.length === MAX_PLAYERS ? p.cmdDamage : np.cmdDamage,
  };
}

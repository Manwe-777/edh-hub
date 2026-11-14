import { POOL_MANA } from '../constants';
import type { Player } from '../types';

/** Mana floating in a player's pool. */
export function poolTotal(p: Player): number {
  return POOL_MANA.reduce((a, c) => a + p.mana[c], 0);
}

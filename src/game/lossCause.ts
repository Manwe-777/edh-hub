import { LETHAL_CMD_DAMAGE, LETHAL_POISON } from '../constants';
import type { Game, LossCause, Player } from '../types';

/** Why `p` has lost, or null while they're still in the game. */
export function lossCause(g: Game, p: Player): LossCause | null {
  if (p.life <= 0) return 'life';
  if (p.counters.poison >= LETHAL_POISON) return 'poison';

  for (let s = 0; s < g.playerCount; s++) {
    if (s === p.id) continue;
    const counted = p.cmdDamage[s].slice(0, g.players[s].commanderCount);
    if (counted.some((d) => d >= LETHAL_CMD_DAMAGE)) return 'cmd';
  }

  return null;
}

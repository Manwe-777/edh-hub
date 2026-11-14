import type { Game } from '../types';

/** Commander damage also moves life: +1 damage = -1 life, removing damage gives it back. */
export function addCmdDamage(g: Game, target: number, source: number, cmd: 0 | 1, delta: number) {
  const t = g.players[target];
  const cur = t.cmdDamage[source][cmd];
  const next = Math.max(0, cur + delta);
  t.cmdDamage[source][cmd] = next;
  t.life -= next - cur;
}

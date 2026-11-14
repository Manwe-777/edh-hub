import type { Player } from '../types';

/** Art of the commanders in play, in order; commanders without art are skipped. */
export function commanderArts(p: Player): string[] {
  return p.commanders
    .slice(0, p.commanderCount)
    .map((c) => c.art)
    .filter((a): a is string => !!a);
}

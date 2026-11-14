import { MAX_PLAYERS } from '../constants';
import type { Game } from '../types';

/** Whether a parsed value has the shape of a saved game this version can read. */
export function isSave(raw: unknown): raw is Game {
  const g = raw as Game | null;
  return (
    !!g && typeof g === 'object' && g.version === 1 && Array.isArray(g.players) && g.players.length === MAX_PLAYERS
  );
}

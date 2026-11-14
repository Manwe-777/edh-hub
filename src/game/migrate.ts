import { DEFAULT_COUNTERS, DEFAULT_LIFE, DEFAULT_PLAYER_COUNT, MAX_PLAYERS } from '../constants';
import type { Game } from '../types';
import { isSave } from './isSave';
import { migratePlayer } from './migratePlayer';
import { newGame } from './newGame';

/** Validates a parsed save and upgrades older shapes. Throws if unusable. */
export function migrate(raw: unknown): Game {
  if (!isSave(raw)) throw new Error('unreadable save');
  const out: Game = { ...newGame(), ...raw };
  out.players = raw.players.map((p, i) => migratePlayer(p, i, raw.startingLife ?? DEFAULT_LIFE));
  if (!Array.isArray(out.defaultCounters)) out.defaultCounters = [...DEFAULT_COUNTERS];
  const count = out.playerCount;
  if (typeof count !== 'number' || count < 2 || count > MAX_PLAYERS) out.playerCount = DEFAULT_PLAYER_COUNT;
  return out;
}

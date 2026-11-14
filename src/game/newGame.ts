import { DEFAULT_COUNTERS, DEFAULT_LIFE, DEFAULT_PLAYER_COUNT, MAX_PLAYERS } from '../constants';
import type { Game } from '../types';
import { newPlayer } from './newPlayer';

export function newGame(): Game {
  return {
    version: 1,
    playerCount: DEFAULT_PLAYER_COUNT,
    startingLife: DEFAULT_LIFE,
    keepAwake: true,
    cmdTally: false,
    defaultCounters: [...DEFAULT_COUNTERS],
    players: Array.from({ length: MAX_PLAYERS }, (_, i) => newPlayer(i, DEFAULT_LIFE)),
    monarch: null,
    initiative: null,
    view: { kind: 'normal' },
    roll: null,
    epoch: 0,
  };
}

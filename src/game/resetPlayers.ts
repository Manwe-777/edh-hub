import { PALETTE } from '../constants';
import type { Game } from '../types';
import { shuffle } from '../utils/shuffle';
import { newPlayer } from './newPlayer';
import { resetGame } from './resetGame';

/** Every seat back to a fresh player (default name, counters, one commander, no art) with distinct random colors; also resets the game. */
export function resetPlayers(g: Game) {
  const colors = shuffle(PALETTE);

  g.players = g.players.map((_, i) => ({
    ...newPlayer(i, g.startingLife),
    color: colors[i % colors.length],
    visibleCounters: [...g.defaultCounters],
  }));

  resetGame(g);
}

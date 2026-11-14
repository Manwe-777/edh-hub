import type { Game } from '../types';
import { zeroMana } from './zeroMana';

/** Empties a player's mana pool. */
export function clearMana(g: Game, id: number) {
  g.players[id].mana = zeroMana();
}

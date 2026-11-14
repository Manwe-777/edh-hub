import type { Game, TokenCounter } from '../types';

/** Gives the monarch or initiative to a player (taking it from whoever had it). */
export function claimToken(g: Game, token: TokenCounter, id: number) {
  g[token] = id;
}

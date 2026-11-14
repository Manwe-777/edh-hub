import type { Game, TokenCounter } from '../types';

/** A player gives up the monarch or initiative; nobody holds it afterwards. */
export function dropToken(g: Game, token: TokenCounter, id: number) {
  if (g[token] === id) g[token] = null;
}

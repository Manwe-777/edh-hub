import type { Game } from '../types';

export function addLife(g: Game, id: number, delta: number) {
  g.players[id].life += delta;
}

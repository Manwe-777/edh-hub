import type { Game, ManaColor } from '../types';

export function addMana(g: Game, id: number, color: ManaColor, delta: number) {
  const m = g.players[id].mana;
  m[color] = Math.max(0, m[color] + delta);
}

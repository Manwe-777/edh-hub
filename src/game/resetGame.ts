import type { Game } from '../types';
import { zeroCounters } from './zeroCounters';
import { zeroDamage } from './zeroDamage';
import { zeroMana } from './zeroMana';

/** New game with the same players: life, damage, counters, mana and tokens back to the start. */
export function resetGame(g: Game) {
  for (const p of g.players) {
    p.life = g.startingLife;
    p.cmdDamage = zeroDamage();
    p.counters = zeroCounters();
    p.mana = zeroMana();
    p.manaOpen = false;
  }
  g.monarch = null;
  g.initiative = null;
  g.view = { kind: 'normal' };
  g.roll = null;
  g.epoch++;
}

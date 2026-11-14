import type { BarItem, CounterKey, Player } from '../types';

/** Buttons in a player's counter bar: their counters (partners pay tax separately, so tax gets a second button), then the mana pool. */
export function counterBarItems(p: Player): BarItem[] {
  return [
    ...p.visibleCounters.flatMap((k): CounterKey[] => (k === 'tax' && p.commanderCount === 2 ? ['tax', 'tax2'] : [k])),
    'mana',
  ];
}

import { MAX_VISIBLE_COUNTERS } from '../constants';
import type { CounterKey } from '../types';

/** Adds or removes a counter from a visible-counters list, up to MAX_VISIBLE_COUNTERS. */
export function toggleCounter(list: CounterKey[], k: CounterKey) {
  const i = list.indexOf(k);
  if (i >= 0) list.splice(i, 1);
  else if (list.length < MAX_VISIBLE_COUNTERS) list.push(k);
}

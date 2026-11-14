import { MAX_PLAYERS } from '../constants';

/** No commander damage from any seat. */
export function zeroDamage(): [number, number][] {
  return Array.from({ length: MAX_PLAYERS }, () => [0, 0]);
}

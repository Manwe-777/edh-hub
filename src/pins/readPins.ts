import { PINS_KEY } from '../constants';
import { readJson } from '../utils/readJson';

/** Saved pinned commander names; corrupt data reads as none. */
export function readPins(): string[] {
  const v = readJson<unknown>(PINS_KEY, []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

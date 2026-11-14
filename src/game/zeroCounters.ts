import type { NumericCounter } from '../types';

export function zeroCounters(): Record<NumericCounter, number> {
  return { poison: 0, experience: 0, energy: 0, rad: 0, tax: 0, tax2: 0, storm: 0 };
}

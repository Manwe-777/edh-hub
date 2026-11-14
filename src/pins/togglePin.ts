import { PINS_KEY } from '../constants';
import { writeStorage } from '../utils/writeStorage';
import { pinState } from './state';

/** Pins or unpins a commander; the list stays alphabetical. */
export function togglePin(name: string) {
  const pins = pinState.current;

  pinState.current = pins.includes(name)
    ? pins.filter((n) => n !== name)
    : [...pins, name].sort((a, b) => a.localeCompare(b));

  writeStorage(PINS_KEY, JSON.stringify(pinState.current)); // unavailable storage: pins last for this session
  pinState.listeners.forEach((l) => l());
}

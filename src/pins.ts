import { useSyncExternalStore } from 'react';

/** Pinned commander names, per device; kept apart from the game so resets don't touch them. */
const KEY = 'edh-hub/pinned-commanders';
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

let pins = read();

export function togglePin(name: string) {
  pins = pins.includes(name) ? pins.filter((n) => n !== name) : [...pins, name].sort((a, b) => a.localeCompare(b));
  try {
    localStorage.setItem(KEY, JSON.stringify(pins));
  } catch {
    /* storage unavailable: pins last for this session only */
  }
  listeners.forEach((l) => l());
}

export function usePins(): string[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => pins,
  );
}

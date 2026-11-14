import { STATE_KEY } from '../constants';
import type { Store } from '../types';
import { writeStorage } from '../utils/writeStorage';
import { state } from './state';

/** Replaces the store and saves it synchronously, so the last tap survives a crash or reload. */
export function commit(next: Store) {
  state.current = next;
  writeStorage(STATE_KEY, JSON.stringify(next)); // full or blocked storage: keep running in memory
  state.listeners.forEach((l) => l());
}

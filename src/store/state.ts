import type { Store } from '../types';
import { loadStore } from './loadStore';

/** The app's single store, loaded once at startup. */
export const state: { current: Store; listeners: Set<() => void> } = {
  current: loadStore(),
  listeners: new Set(),
};

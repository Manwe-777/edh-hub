import { useSyncExternalStore } from 'react';

import type { Store } from '../types';
import { state } from './state';

const subscribe = (l: () => void) => {
  state.listeners.add(l);
  return () => state.listeners.delete(l);
};

const snapshot = () => state.current;

export function useStore(): Store {
  return useSyncExternalStore(subscribe, snapshot);
}

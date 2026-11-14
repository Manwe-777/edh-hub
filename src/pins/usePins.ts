import { useSyncExternalStore } from 'react';

import { pinState } from './state';

const subscribe = (l: () => void) => {
  pinState.listeners.add(l);
  return () => pinState.listeners.delete(l);
};

const snapshot = () => pinState.current;

export function usePins(): string[] {
  return useSyncExternalStore(subscribe, snapshot);
}

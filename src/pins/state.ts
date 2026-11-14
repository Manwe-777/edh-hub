import { readPins } from './readPins';

export const pinState: { current: string[]; listeners: Set<() => void> } = {
  current: readPins(),
  listeners: new Set(),
};

import type { Game } from '../game/Game';
import { loadStore } from './loadStore';

export interface Store {
  game: Game;
  undo: Game[];
}

/** The app's single store, loaded once at startup. */
export const state: { current: Store; listeners: Set<() => void> } = {
  current: loadStore(),
  listeners: new Set(),
};

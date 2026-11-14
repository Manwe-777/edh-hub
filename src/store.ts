import { useSyncExternalStore } from 'react';

import { type Game, migrate, newGame } from './game';

const KEY = 'edh-hub/state';
const BACKUP_KEY = 'edh-hub/state-backup';
const UNDO_LIMIT = 20;

export interface Store {
  game: Game;
  undo: Game[];
}

function load(): Store {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { game: newGame(), undo: [] };
  }
  if (!raw) return { game: newGame(), undo: [] };
  try {
    const parsed = JSON.parse(raw) as { game: unknown; undo?: unknown[] };
    const game = migrate(parsed.game);
    const undo: Game[] = [];
    for (const u of parsed.undo ?? []) {
      try {
        undo.push(migrate(u));
      } catch {
        /* drop unreadable undo entries */
      }
    }
    return { game, undo: undo.slice(-UNDO_LIMIT) };
  } catch {
    try {
      localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* ignore */
    }
    return { game: newGame(), undo: [] };
  }
}

let store: Store = load();
const listeners = new Set<() => void>();

function commit(next: Store) {
  store = next;
  // Written synchronously on every change so the last tap survives a crash or reload.
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage full or blocked: keep running in memory */
  }
  listeners.forEach((l) => l());
}

/**
 * Apply a change to a copy of the game. `undoable` changes push the previous
 * game onto the undo stack; UI-only changes (views, toggles) don't.
 */
export function mutate(fn: (g: Game) => void, undoable = true) {
  const next = structuredClone(store.game);
  fn(next);
  commit({
    game: next,
    undo: undoable ? [...store.undo, store.game].slice(-UNDO_LIMIT) : store.undo,
  });
}

export function undo() {
  if (!store.undo.length) return;
  const prev = store.undo[store.undo.length - 1];
  // Restore the game data and return to the normal view.
  commit({ game: { ...prev, view: { kind: 'normal' }, roll: null }, undo: store.undo.slice(0, -1) });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useStore(): Store {
  return useSyncExternalStore(subscribe, () => store);
}

import { STATE_BACKUP_KEY, STATE_KEY, UNDO_LIMIT } from '../constants';
import { migrate } from '../game/migrate';
import { newGame } from '../game/newGame';
import type { Game, Store } from '../types';
import { readStorage } from '../utils/readStorage';
import { writeStorage } from '../utils/writeStorage';

/** The saved game and undo history; a fresh game when there is none or it can't be read (the unreadable save is backed up). */
export function loadStore(): Store {
  const raw = readStorage(STATE_KEY);
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
    writeStorage(STATE_BACKUP_KEY, raw);
    return { game: newGame(), undo: [] };
  }
}

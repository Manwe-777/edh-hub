import { UNDO_LIMIT } from '../constants';
import type { Game } from '../game/Game';
import { commit } from './commit';
import { state } from './state';

/**
 * Apply a change to a copy of the game. `undoable` changes push the previous
 * game onto the undo stack; UI-only changes (views, toggles) don't.
 */
export function mutate(fn: (g: Game) => void, undoable = true) {
  const { game, undo } = state.current;
  const next = game.clone();
  fn(next);
  commit({ game: next, undo: undoable ? [...undo, game].slice(-UNDO_LIMIT) : undo });
}

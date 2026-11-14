import { commit } from './commit';
import { state } from './state';

/** Restores the game before the last undoable change and returns to the normal view. */
export function undo() {
  const stack = state.current.undo;
  if (!stack.length) return;
  const prev = stack[stack.length - 1].clone();
  prev.showTable();
  commit({ game: prev, undo: stack.slice(0, -1) });
}

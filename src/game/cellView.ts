import type { Game, Player, TallySquare } from '../types';
import { tallySources } from './tallySources';

export interface CellView {
  /** A commander damage view is open. */
  inCmd: boolean;
  /** This player is the one whose damage taken is shown. */
  isTarget: boolean;
  /** The mana pool is open and nothing covers it. */
  manaShown: boolean;
  /** Damage tally squares to show (none when the tally is off or a view covers the table). */
  tally: TallySquare[][];
}

/** What a player's cell shows, given the current view. */
export function cellView(game: Game, p: Player): CellView {
  const view = game.view;
  const inCmd = view.kind === 'cmd';
  const overlay = inCmd || !!game.roll;
  return {
    inCmd,
    isTarget: inCmd && view.target === p.id,
    manaShown: p.manaOpen && !overlay,
    tally: game.cmdTally && !overlay ? tallySources(game, p) : [],
  };
}

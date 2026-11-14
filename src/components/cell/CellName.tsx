import { NAME_H } from '../../constants';
import type { Game } from '../../game/Game';
import type { Player } from '../../game/Player';
import { CounterIcon } from '../icons/CounterIcon';

interface Props {
  game: Game;
  p: Player;
  padRight?: number;
  /** Show the life total next to the name (when the mana pool covers it). */
  showLife: boolean;
}

/** Name row: held tokens, the name, and who this cell is dealing damage to. */
export function CellName({ game, p, padRight, showLife }: Props) {
  const view = game.view;
  const dealtTo = view.kind === 'cmd' && view.target !== p.id ? game.players[view.target].name : null;
  return (
    <div className="cell-name" style={{ height: NAME_H, paddingRight: padRight }}>
      {game.monarch === p.id && (
        <span className="name-token">
          <CounterIcon k="monarch" />
        </span>
      )}
      {game.initiative === p.id && (
        <span className="name-token">
          <CounterIcon k="initiative" />
        </span>
      )}
      <span className="name-text">{p.name}</span>
      {showLife && <span className="name-life">{p.life}</span>}
      {dealtTo && <span className="dealt">→ {dealtTo}</span>}
    </div>
  );
}

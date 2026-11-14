import type { CSSProperties } from 'react';

import type { Player } from '../../game/Player';
import { mutate } from '../../store/mutate';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';
import { ManaPoolIcon } from '../icons/ManaPoolIcon';

/** Tap opens/closes the mana pool; hold empties it. */
export function ManaPoolButton({ p, style }: { p: Player; style: CSSProperties }) {
  const total = p.poolTotal;
  return (
    <Press
      className={cx('ctr ctr-mana', p.manaOpen && 'on')}
      style={style}
      label="Mana pool"
      onTap={() => mutate((g) => void (g.players[p.id].manaOpen = !g.players[p.id].manaOpen), false)}
      onHold={() => mutate((g) => g.players[p.id].clearMana())}
      repeat={false}
    >
      <ManaPoolIcon />
      {total > 0 && <span className="badge">{total}</span>}
    </Press>
  );
}

import type { CSSProperties } from 'react';

import { clearMana } from '../../game/clearMana';
import { poolTotal } from '../../game/poolTotal';
import { mutate } from '../../store/mutate';
import type { Player } from '../../types';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';
import { ManaPoolIcon } from '../icons/ManaPoolIcon';

/** Tap opens/closes the mana pool; hold empties it. */
export function ManaPoolButton({ p, style }: { p: Player; style: CSSProperties }) {
  const total = poolTotal(p);
  return (
    <Press
      className={cx('ctr ctr-mana', p.manaOpen && 'on')}
      style={style}
      label="Mana pool"
      onTap={() => mutate((g) => void (g.players[p.id].manaOpen = !g.players[p.id].manaOpen), false)}
      onHold={() => mutate((g) => clearMana(g, p.id))}
      repeat={false}
    >
      <ManaPoolIcon />
      {total > 0 && <span className="badge">{total}</span>}
    </Press>
  );
}

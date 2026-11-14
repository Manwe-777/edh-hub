import type { Player } from '../../game/Player';
import { mutate } from '../../store/mutate';
import type { ManaColor, ManaLayout } from '../../types';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';
import { ManaSymbol } from '../icons/ManaSymbol';

interface Props {
  p: Player;
  c: ManaColor;
  layout: ManaLayout;
}

/** One color's count with − and + (in a row: − count +; stacked: + count −). */
export function ManaEntry({ p, c, layout }: Props) {
  const { row, btn, slotW, slotH } = layout;

  const button = (n: 1 | -1) => (
    <Press
      className="sq-btn bare"
      style={{ width: btn, height: btn }}
      onTap={() => mutate((g) => g.addMana(p.id, c, n))}
      label={`${n > 0 ? 'Add' : 'Remove'} ${c}`}
    >
      {n > 0 ? '+' : '−'}
    </Press>
  );

  return (
    <div className={cx('mana-entry', row && 'row')} style={{ width: slotW, height: slotH }}>
      {button(row ? -1 : 1)}
      <div className="mana-count" style={{ fontSize: Math.max(16, Math.min(24, btn * 0.48)) }}>
        <span>{p.mana[c]}</span>
        <ManaSymbol c={c} />
      </div>
      {button(row ? 1 : -1)}
    </div>
  );
}

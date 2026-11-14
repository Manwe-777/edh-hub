import type { CSSProperties } from 'react';

import { LETHAL_POISON } from '../../constants';
import type { Player } from '../../game/Player';
import { mutate } from '../../store/mutate';
import type { NumericCounter } from '../../types';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';
import { CounterIcon } from '../icons/CounterIcon';

interface Props {
  p: Player;
  k: NumericCounter;
  style: CSSProperties;
  onFlash: (k: NumericCounter) => void;
}

/** Tap adds one, hold removes one; either way the value flashes over the life total. */
export function NumericCounterButton({ p, k, style, onFlash }: Props) {
  const v = p.counters[k];

  const step = (n: number) => {
    mutate((g) => g.addCounter(p.id, k, n));
    onFlash(k);
  };

  const partnerTax = p.commanderCount === 2 && (k === 'tax' || k === 'tax2');
  return (
    <Press
      className={cx('ctr', `ctr-${k}`, v > 0 && 'on', k === 'poison' && v >= LETHAL_POISON && 'lethal')}
      style={style}
      label={k}
      onTap={() => step(1)}
      onHold={() => step(-1)}
    >
      <CounterIcon k={k} />
      {v > 0 && <span className="badge">{v}</span>}
      {partnerTax && <span className="ctr-idx">{k === 'tax' ? 1 : 2}</span>}
    </Press>
  );
}

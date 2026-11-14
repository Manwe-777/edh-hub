import { useEffect, useRef, useState } from 'react';

import { MANA_GAP, POOL_MANA } from '../../constants';
import type { Pad, Player } from '../../types';
import { cx } from '../../utils/cx';
import { manaLayout } from '../../utils/manaLayout';
import { ManaEntry } from './ManaEntry';

interface Props {
  p: Player;
  lw: number;
  pad: Pad;
  leaving: boolean;
}

/** Mana pool: a shade over the cell with a +/− entry per color. */
export function ManaOverlay({ p, lw, pad, leaving }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => setH(ref.current?.clientHeight ?? 0), []);
  const layout = manaLayout(POOL_MANA.length, lw - 16, Math.max(0, h - pad.top - pad.bottom - 8));
  return (
    <div ref={ref} className={cx('mana-shade', leaving && 'leaving')}>
      {h > 0 && (
        <div
          className="mana"
          style={{
            top: pad.top,
            bottom: pad.bottom,
            // Exactly `cols` entries per line, centered; flex-wrapped so an incomplete last row is centered too.
            left: 0,
            right: 0,
            margin: '0 auto',
            width: layout.cols * layout.slotW + (layout.cols - 1) * MANA_GAP,
          }}
        >
          {POOL_MANA.map((c) => (
            <ManaEntry key={c} p={p} c={c} layout={layout} />
          ))}
        </div>
      )}
    </div>
  );
}

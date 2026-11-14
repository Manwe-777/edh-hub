import { LETHAL_POISON } from '../../constants';
import type { Player } from '../../game/Player';
import type { CellGeometry, NumericCounter } from '../../types';
import { CounterIcon } from '../icons/CounterIcon';

interface Props {
  p: Player;
  /** The counter to show; nothing renders without one. */
  k?: NumericCounter;
  geo: CellGeometry;
}

/** A counter's value shown over the life total for a moment (the finger covers the counter's own badge). */
export function CounterFlash({ p, k, geo }: Props) {
  if (!k) return null;
  const lethal = k === 'poison' && p.counters.poison >= LETHAL_POISON;
  return (
    <div className="flash" style={{ top: geo.pad.top, bottom: geo.pad.bottom, fontSize: geo.lifeFont }}>
      <span className={lethal ? 'lethal' : undefined}>
        <CounterIcon k={k} />
        {p.counters[k]}
      </span>
    </div>
  );
}

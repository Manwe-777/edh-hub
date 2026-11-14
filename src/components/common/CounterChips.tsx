import { ALL_COUNTERS, COUNTER_LABEL } from '../../constants';
import type { CounterKey } from '../../types';
import { cx } from '../../utils/cx';
import { CounterIcon } from '../icons/CounterIcon';

interface Props {
  selected: CounterKey[];
  onToggle: (k: CounterKey) => void;
}

/** Counter on/off chips, shared by player options and the game menu's defaults. */
export function CounterChips({ selected, onToggle }: Props) {
  return (
    <div className="chips">
      {ALL_COUNTERS.map((k) => (
        <button key={k} className={cx('chip', selected.includes(k) && 'on')} onClick={() => onToggle(k)}>
          <CounterIcon k={k} /> {COUNTER_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

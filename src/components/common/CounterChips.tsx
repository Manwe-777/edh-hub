import { ALL_COUNTERS, COUNTER_LABEL } from '../../constants';
import type { CounterKey } from '../../types';
import { cx } from '../../utils/cx';
import { CounterIcon } from '../icons/CounterIcon';
import { CHIP, CHIP_OFF, CHIP_ON } from './styles';

interface Props {
  selected: CounterKey[];
  onToggle: (k: CounterKey) => void;
}

/** Counter on/off chips, shared by player options and the game menu's defaults. */
export function CounterChips({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_COUNTERS.map((k) => (
        <button
          key={k}
          className={cx(CHIP, selected.includes(k) ? CHIP_ON : CHIP_OFF)}
          aria-pressed={selected.includes(k)}
          onClick={() => onToggle(k)}
        >
          <CounterIcon k={k} /> {COUNTER_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

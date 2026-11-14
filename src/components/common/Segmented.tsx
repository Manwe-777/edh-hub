import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';
import { SEGMENT_CELL, SEGMENT_OFF, SEGMENT_ON } from './styles';

interface Props<T> {
  options: readonly T[];
  selected?: T;
  onSelect: (v: T) => void;
  label?: (v: T) => ReactNode;
  plain?: boolean;
  /** Extra cell after the options (e.g. a custom value input). */
  extra?: ReactNode;
}

/** Equal-width segmented control. */
export function Segmented<T extends string | number>({ options, selected, onSelect, label, plain, extra }: Props<T>) {
  const n = options.length + (extra ? 1 : 0);
  return (
    <div className="grid gap-1 rounded-[14px] bg-surface p-1" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
      {options.map((v) => (
        <button
          key={v}
          className={cx(SEGMENT_CELL, plain && 'font-normal', selected === v ? SEGMENT_ON : SEGMENT_OFF)}
          aria-pressed={selected === v}
          onClick={() => onSelect(v)}
        >
          {label ? label(v) : v}
        </button>
      ))}
      {extra}
    </div>
  );
}

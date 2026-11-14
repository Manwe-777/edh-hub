import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';

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
    <div className={cx('segmented', plain && 'plain')} style={{ ['--n' as string]: n }}>
      {options.map((v) => (
        <button key={v} className={cx(selected === v && 'on')} onClick={() => onSelect(v)}>
          {label ? label(v) : v}
        </button>
      ))}
      {extra}
    </div>
  );
}

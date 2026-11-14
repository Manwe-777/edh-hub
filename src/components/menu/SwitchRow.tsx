import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';
import { LIST_ROW } from '../common/styles';

interface Props {
  icon: ReactNode;
  label: string;
  on: boolean;
  onToggle: () => void;
}

export function SwitchRow({ icon, label, on, onToggle }: Props) {
  return (
    <button className={LIST_ROW} onClick={onToggle} role="switch" aria-checked={on}>
      {icon}
      <span className="flex-1">{label}</span>
      <span
        className={cx(
          "relative h-[26px] w-11 flex-none rounded-[13px] transition-colors after:absolute after:top-[3px] after:left-[3px] after:size-5 after:rounded-full after:transition after:content-['']",
          on ? 'bg-switch after:translate-x-[18px] after:bg-white' : 'bg-surface-2 after:bg-muted',
        )}
      />
    </button>
  );
}

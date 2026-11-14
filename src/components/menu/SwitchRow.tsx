import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';

interface Props {
  icon: ReactNode;
  label: string;
  on: boolean;
  onToggle: () => void;
}

export function SwitchRow({ icon, label, on, onToggle }: Props) {
  return (
    <button className="row" onClick={onToggle} role="switch" aria-checked={on}>
      {icon}
      <span>{label}</span>
      <span className={cx('switch', on && 'on')} />
    </button>
  );
}

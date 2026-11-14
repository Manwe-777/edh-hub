import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';

interface Props {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/** One of the menu's big square action buttons. */
export function Tile({ icon, label, onClick, danger, disabled }: Props) {
  return (
    <button
      className={cx(
        'flex h-[92px] flex-col items-center justify-center gap-2 rounded-2xl bg-surface text-sm font-medium transition-colors active:bg-surface-2 active:transition-none disabled:opacity-35 [&_.ms]:text-[26px]',
        danger ? 'text-danger' : 'text-text',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span className={cx(danger && 'text-[13px] tracking-[.06em] uppercase')}>{label}</span>
    </button>
  );
}

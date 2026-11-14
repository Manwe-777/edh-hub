import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '../../utils/cx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Smaller, muted variant used inside cards. */
  small?: boolean;
  /** Text color class for the small variant (muted by default). */
  tone?: string;
  children: ReactNode;
}

/** Round icon-only button. */
export function IconButton({ small, tone = 'text-muted', className, children, ...rest }: Props) {
  return (
    <button
      className={cx(
        'grid flex-none place-items-center rounded-full transition-colors active:bg-surface-2 active:transition-none',
        small ? `size-9 ${tone}` : '-mr-2 size-11 text-text',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

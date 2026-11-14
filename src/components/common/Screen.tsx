import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';
import { UiIcon } from '../icons/UiIcon';
import { IconButton } from './IconButton';

interface Props {
  leaving: boolean;
  onClose: () => void;
  /** Header content left of the close button. */
  head: ReactNode;
  children: ReactNode;
}

/** Full-screen upright panel that slides up, with a close button top right. */
export function Screen({ leaving, onClose, head, children }: Props) {
  return (
    <div
      className={cx(
        'fixed inset-0 z-10 touch-auto overflow-y-auto bg-bg select-text in-[.phone]:absolute in-[.phone]:rounded-[18px]',
        leaving ? 'animate-screen-out' : 'animate-screen-in',
      )}
    >
      <div className="mx-auto max-w-[520px] px-4 pt-2 pb-8">
        <header className="flex h-[60px] items-center gap-3">
          {head}
          <IconButton onClick={onClose} aria-label="Close">
            <UiIcon name="close" />
          </IconButton>
        </header>
        {children}
      </div>
    </div>
  );
}

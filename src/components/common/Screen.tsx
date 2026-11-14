import type { ReactNode } from 'react';

import { cx } from '../../utils/cx';
import { UiIcon } from '../icons/UiIcon';

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
    <div className={cx('screen', leaving && 'leaving')}>
      <div className="screen-body">
        <header className="screen-head">
          {head}
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <UiIcon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

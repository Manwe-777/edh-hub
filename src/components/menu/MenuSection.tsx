import type { ReactNode } from 'react';

import { UiIcon } from '../icons/UiIcon';
import type { UiIconName } from '../icons/uiIconPaths';

interface Props {
  title: string;
  icon?: UiIconName;
  note?: string;
  /** Shown at the end of the heading row. */
  aside?: ReactNode;
  children: ReactNode;
}

/** A titled group in a full-screen panel. */
export function MenuSection({ title, icon, note, aside, children }: Props) {
  return (
    <section className="group">
      <h3>
        {icon && <UiIcon name={icon} size={18} />} {title}
        {note && <small>{note}</small>}
        {aside}
      </h3>
      {children}
    </section>
  );
}

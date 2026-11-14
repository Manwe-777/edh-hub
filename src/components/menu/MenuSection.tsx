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
    <section className="mt-6">
      <h3 className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-muted">
        {icon && <UiIcon name={icon} size={18} />} {title}
        {note && <small className="text-xs font-normal opacity-70">{note}</small>}
        {aside}
      </h3>
      {children}
    </section>
  );
}

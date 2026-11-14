import type { CSSProperties, ReactNode } from 'react';

import { usePress } from '../../hooks/usePress';
import type { PressOptions } from '../../types';

interface Props extends PressOptions {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  label?: string;
}

/** A div with tap / hold / swipe handling. */
export function Press({ className, style, children, label, ...opts }: Props) {
  const h = usePress(opts);
  return (
    <div className={className} style={style} role="button" aria-label={label} {...h}>
      {children}
    </div>
  );
}

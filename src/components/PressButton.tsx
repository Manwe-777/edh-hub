import type { CSSProperties, ReactNode } from 'react';
import { usePress, type PressOptions } from '../usePress';

/** A div with tap / hold / swipe handling. */
export function Press(props: PressOptions & { className?: string; style?: CSSProperties; children?: ReactNode; label?: string }) {
  const { className, style, children, label, ...opts } = props;
  const h = usePress(opts);
  return (
    <div className={className} style={style} role="button" aria-label={label} {...h}>
      {children}
    </div>
  );
}

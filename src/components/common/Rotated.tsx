import type { CSSProperties, ReactNode } from 'react';

import { ROTATION } from '../../constants';
import type { Dir } from '../../types';
import { isSideways } from '../../utils/isSideways';

interface Props {
  w: number;
  h: number;
  dir: Dir;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Fills a w×h box with content laid out in the player's orientation. */
export function Rotated({ w, h, dir, className, style, children }: Props) {
  const side = isSideways(dir);
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: side ? h : w,
        height: side ? w : h,
        transform: `translate(-50%, -50%) rotate(${ROTATION[dir]}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

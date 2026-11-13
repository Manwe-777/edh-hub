import type { CSSProperties, ReactNode } from 'react';
import type { Dir } from '../game';
import { ROTATION, isSideways } from '../layouts';

/** Fills a w×h box with content laid out in the player's orientation. */
export function Rotated(props: { w: number; h: number; dir: Dir; className?: string; style?: CSSProperties; children: ReactNode }) {
  const { w, h, dir } = props;
  const side = isSideways(dir);
  return (
    <div
      className={props.className}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: side ? h : w,
        height: side ? w : h,
        transform: `translate(-50%, -50%) rotate(${ROTATION[dir]}deg)`,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

/** Local (rotated) width/height of a w×h box. */
export const localSize = (w: number, h: number, dir: Dir) => (isSideways(dir) ? { lw: h, lh: w } : { lw: w, lh: h });

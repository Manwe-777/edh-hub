import type { CSSProperties } from 'react';

import type { Viewport } from '../types';

/** Centers the `?phone` frame in the window, scaled down to fit with an 8px margin. */
export function phoneFrameStyle({ vw, vh }: Viewport, win: { w: number; h: number }): CSSProperties {
  const scale = Math.min(1, (win.w - 16) / vw, (win.h - 16) / vh);
  return { width: vw, height: vh, transform: `translate(-50%, -50%) scale(${scale})` };
}

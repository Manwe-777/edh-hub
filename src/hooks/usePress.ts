import { type MouseEvent, type PointerEvent, useLayoutEffect, useRef } from 'react';

import { HOLD_MS, MOVE_SLOP, REPEAT_MS } from '../constants';
import type { PressOptions } from '../types';
import { swipeDirection } from '../utils/swipeDirection';

interface Track {
  id: number;
  x: number;
  y: number;
  moved: boolean;
  held: boolean;
}

/** Tap / hold-with-repeat / vertical swipe on one element, via pointer events. */
export function usePress(opts: PressOptions) {
  const o = useRef(opts);
  useLayoutEffect(() => {
    o.current = opts;
  });
  const t = useRef<Track | null>(null);
  const timers = useRef<{ hold?: number; rep?: number }>({});
  const el = useRef<HTMLElement | null>(null);

  const release = () => {
    el.current?.classList.remove('pressed');
    el.current = null;
  };
  const clear = () => {
    window.clearTimeout(timers.current.hold);
    window.clearInterval(timers.current.rep);
    timers.current = {};
  };
  const startHold = () => {
    if (!t.current) return;
    t.current.held = true;
    navigator.vibrate?.(15);
    o.current.onHold?.();
    if (o.current.repeat !== false) timers.current.rep = window.setInterval(() => o.current.onHold?.(), REPEAT_MS);
  };

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (t.current) return; // one pointer per element
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      t.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, held: false };
      el.current = e.currentTarget;
      el.current.classList.add('pressed');
      if (o.current.onHold) timers.current.hold = window.setTimeout(startHold, HOLD_MS);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const s = t.current;
      if (!s || s.id !== e.pointerId || s.moved) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) <= MOVE_SLOP) return;
      s.moved = true;
      if (!s.held) clear();
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const s = t.current;
      if (!s || s.id !== e.pointerId) return;
      clear();
      release();
      t.current = null;
      if (s.held) return;
      if (!s.moved) {
        o.current.onTap?.();
        return;
      }
      const dir = swipeDirection(e.clientX - s.x, e.clientY - s.y, o.current.rotation ?? 0);
      if (dir) o.current.onSwipe?.(dir);
    },
    onPointerCancel() {
      clear();
      release();
      t.current = null;
    },
    onContextMenu(e: MouseEvent) {
      e.preventDefault();
    },
  };
}

import { useRef, type PointerEvent } from 'react';

export interface PressOptions {
  onTap?: () => void;
  /** Fires once after HOLD_MS, then repeats every REPEAT_MS while held (if `repeat`). */
  onHold?: () => void;
  repeat?: boolean;
  /** Direction in the element's local (rotated) frame. */
  onSwipe?: (dir: 'up' | 'down') => void;
  /** Clockwise rotation (deg) applied to the element, to map screen motion into its frame. */
  rotation?: number;
}

const HOLD_MS = 450;
const REPEAT_MS = 650;
const MOVE_SLOP = 12;
const SWIPE_MIN = 40;

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
  o.current = opts;
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
      if (o.current.onHold) {
        timers.current.hold = window.setTimeout(() => {
          if (!t.current) return;
          t.current.held = true;
          navigator.vibrate?.(15);
          o.current.onHold?.();
          if (o.current.repeat !== false) {
            timers.current.rep = window.setInterval(() => o.current.onHold?.(), REPEAT_MS);
          }
        }, HOLD_MS);
      }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const s = t.current;
      if (!s || s.id !== e.pointerId || s.moved) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_SLOP) {
        s.moved = true;
        if (!s.held) clear();
      }
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
      // Rotate screen delta back into the element's local frame.
      const th = (-(o.current.rotation ?? 0) * Math.PI) / 180;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      const lx = dx * Math.cos(th) - dy * Math.sin(th);
      const ly = dx * Math.sin(th) + dy * Math.cos(th);
      if (Math.abs(ly) > SWIPE_MIN && Math.abs(ly) > Math.abs(lx)) {
        o.current.onSwipe?.(ly < 0 ? 'up' : 'down');
      }
    },
    onPointerCancel() {
      clear();
      release();
      t.current = null;
    },
    onContextMenu(e: React.MouseEvent) {
      e.preventDefault();
    },
  };
}

import { SWIPE_MIN } from '../constants';
import type { SwipeDir } from '../types';

/**
 * Vertical swipe in an element's local frame, from a screen-space pointer move.
 * `rotation` is the element's clockwise CSS rotation in degrees.
 */
export function swipeDirection(dx: number, dy: number, rotation: number): SwipeDir | null {
  const th = (-rotation * Math.PI) / 180;
  const lx = dx * Math.cos(th) - dy * Math.sin(th);
  const ly = dx * Math.sin(th) + dy * Math.cos(th);
  if (Math.abs(ly) <= SWIPE_MIN || Math.abs(ly) <= Math.abs(lx)) return null;
  return ly < 0 ? 'up' : 'down';
}

import { act, renderHook } from '@testing-library/react';
import type { PointerEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HOLD_MS, REPEAT_MS } from '../constants';
import type { PressOptions } from '../types';
import { usePress } from './usePress';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const el = document.createElement('div');

const ev = (x: number, y: number, pointerId = 1) =>
  ({
    pointerId,
    clientX: x,
    clientY: y,
    currentTarget: el,
    stopPropagation() {},
  }) as unknown as PointerEvent<HTMLElement>;

function setup(opts: PressOptions) {
  const { result } = renderHook(() => usePress(opts));
  return result.current;
}

describe('usePress', () => {
  it('a quick press is a tap', () => {
    const onTap = vi.fn();
    const onHold = vi.fn();
    const h = setup({ onTap, onHold });
    h.onPointerDown(ev(10, 10));
    vi.advanceTimersByTime(HOLD_MS - 50);
    h.onPointerUp(ev(10, 10));
    expect(onTap).toHaveBeenCalledOnce();
    expect(onHold).not.toHaveBeenCalled();
  });

  it('holding fires once, then repeats until released, with no tap', () => {
    const onTap = vi.fn();
    const onHold = vi.fn();
    const h = setup({ onTap, onHold });
    h.onPointerDown(ev(0, 0));
    vi.advanceTimersByTime(HOLD_MS);
    expect(onHold).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(REPEAT_MS * 2);
    expect(onHold).toHaveBeenCalledTimes(3);
    h.onPointerUp(ev(0, 0));
    vi.advanceTimersByTime(REPEAT_MS * 3);
    expect(onHold).toHaveBeenCalledTimes(3);
    expect(onTap).not.toHaveBeenCalled();
  });

  it('holds can be single-shot', () => {
    const onHold = vi.fn();
    const h = setup({ onHold, repeat: false });
    h.onPointerDown(ev(0, 0));
    vi.advanceTimersByTime(HOLD_MS + REPEAT_MS * 3);
    expect(onHold).toHaveBeenCalledOnce();
  });

  it('a swipe reports its direction in the rotated frame and cancels the hold', () => {
    const onSwipe = vi.fn();
    const onHold = vi.fn();
    const onTap = vi.fn();
    const h = setup({ onSwipe, onHold, onTap, rotation: 180 });
    h.onPointerDown(ev(100, 100));
    h.onPointerMove(ev(100, 180));
    vi.advanceTimersByTime(HOLD_MS * 2);
    h.onPointerUp(ev(100, 180));
    expect(onSwipe).toHaveBeenCalledWith('up');
    expect(onHold).not.toHaveBeenCalled();
    expect(onTap).not.toHaveBeenCalled();
  });

  it('a small wobble is still a tap', () => {
    const onTap = vi.fn();
    const h = setup({ onTap });
    h.onPointerDown(ev(50, 50));
    h.onPointerMove(ev(55, 53));
    h.onPointerUp(ev(55, 53));
    expect(onTap).toHaveBeenCalledOnce();
  });

  it('ignores a second finger and cancels cleanly', () => {
    const onTap = vi.fn();
    const h = setup({ onTap });
    h.onPointerDown(ev(0, 0, 1));
    h.onPointerDown(ev(0, 0, 2));
    h.onPointerUp(ev(0, 0, 2));
    expect(onTap).not.toHaveBeenCalled();
    h.onPointerCancel();
    h.onPointerUp(ev(0, 0, 1));
    expect(onTap).not.toHaveBeenCalled();
  });

  it('marks the element as pressed while held down', () => {
    const h = setup({ onTap: () => {} });
    h.onPointerDown(ev(0, 0));
    expect(el.classList.contains('pressed')).toBe(true);
    act(() => h.onPointerUp(ev(0, 0)));
    expect(el.classList.contains('pressed')).toBe(false);
  });
});

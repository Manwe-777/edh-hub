import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FLASH_MS, LIFE_DELTA_MS, PRESENCE_MS, SPIN_MS } from '../constants';
import { useCounterFlash } from './useCounterFlash';
import { useLifeDelta } from './useLifeDelta';
import { usePresence } from './usePresence';
import { useSpin } from './useSpin';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('usePresence', () => {
  it('stays mounted while animating out, then unmounts', () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open), { initialProps: { open: false } });
    expect(result.current.mounted).toBe(false);
    rerender({ open: true });
    expect(result.current).toEqual({ mounted: true, leaving: false });
    rerender({ open: false });
    expect(result.current).toEqual({ mounted: true, leaving: true });
    act(() => vi.advanceTimersByTime(PRESENCE_MS));
    expect(result.current).toEqual({ mounted: false, leaving: false });
  });

  it('reopening while leaving cancels the exit', () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open), { initialProps: { open: true } });
    rerender({ open: false });
    rerender({ open: true });
    act(() => vi.advanceTimersByTime(PRESENCE_MS * 2));
    expect(result.current).toEqual({ mounted: true, leaving: false });
  });
});

describe('useLifeDelta', () => {
  it('adds up quick changes and clears after a pause', () => {
    const { result, rerender } = renderHook(({ life }) => useLifeDelta(life, 0), { initialProps: { life: 40 } });
    expect(result.current).toBe(0);
    rerender({ life: 39 });
    rerender({ life: 36 });
    expect(result.current).toBe(-4);
    act(() => vi.advanceTimersByTime(LIFE_DELTA_MS - 100));
    rerender({ life: 38 });
    expect(result.current).toBe(-2);
    act(() => vi.advanceTimersByTime(LIFE_DELTA_MS));
    expect(result.current).toBe(0);
  });

  it('clears straight away on a reset', () => {
    const { result, rerender } = renderHook(({ life, epoch }) => useLifeDelta(life, epoch), {
      initialProps: { life: 40, epoch: 0 },
    });
    rerender({ life: 30, epoch: 0 });
    expect(result.current).toBe(-10);
    rerender({ life: 40, epoch: 1 });
    expect(result.current).toBe(0);
  });
});

describe('useSpin', () => {
  it('flickers through d20 faces and settles on the rolled value', () => {
    const { result } = renderHook(() => useSpin(17));
    const seen = new Set<number>();
    for (let t = 0; t < SPIN_MS; t += 50) {
      act(() => vi.advanceTimersByTime(50));
      if (!result.current.done) seen.add(result.current.value);
    }
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toEqual({ value: 17, done: true });
    expect(seen.size).toBeGreaterThan(3);
    for (const v of seen) expect(v).toBeGreaterThanOrEqual(1);
  });
});

describe('useCounterFlash', () => {
  it('shows the counter for a moment and restarts on each change', () => {
    const { result } = renderHook(() => useCounterFlash());
    act(() => result.current.show('storm'));
    expect(result.current.flash).toEqual({ k: 'storm', n: 1 });
    act(() => vi.advanceTimersByTime(FLASH_MS - 100));
    act(() => result.current.show('storm'));
    expect(result.current.flash?.n).toBe(2);
    act(() => vi.advanceTimersByTime(FLASH_MS - 100));
    expect(result.current.flash).not.toBeNull();
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.flash).toBeNull();
  });
});

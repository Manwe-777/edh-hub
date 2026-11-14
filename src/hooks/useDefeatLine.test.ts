import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFEAT_LINES, DEFEAT_LINES_BY_CAUSE, DEFEAT_ROTATE_MS } from '../constants';
import type { LossCause } from '../types';
import { useDefeatLine } from './useDefeatLine';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDefeatLine', () => {
  it('has no line while the player is alive', () => {
    const { result } = renderHook(() => useDefeatLine(0, null));
    act(() => vi.advanceTimersByTime(DEFEAT_ROTATE_MS));
    expect(result.current).toBeNull();
  });

  it('picks a line for the cause and rotates it', () => {
    const { result } = renderHook(() => useDefeatLine(0, 'poison'));
    act(() => vi.advanceTimersByTime(1));
    const first = result.current;
    expect([...DEFEAT_LINES, ...DEFEAT_LINES_BY_CAUSE.poison]).toContain(first);
    act(() => vi.advanceTimersByTime(DEFEAT_ROTATE_MS));
    expect(result.current).not.toBe(first);
  });

  it('never shows the same line on two lost players at once', () => {
    const a = renderHook(() => useDefeatLine(0, 'life'));
    const b = renderHook(() => useDefeatLine(1, 'life'));

    for (let i = 0; i < 20; i++) {
      act(() => vi.advanceTimersByTime(DEFEAT_ROTATE_MS));
      expect(a.result.current).not.toBe(b.result.current);
    }
  });

  it('clears when the player comes back', () => {
    const { result, rerender } = renderHook(({ cause }) => useDefeatLine(2, cause), {
      initialProps: { cause: 'cmd' as LossCause | null },
    });

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).not.toBeNull();
    rerender({ cause: null });
    expect(result.current).toBeNull();
  });
});

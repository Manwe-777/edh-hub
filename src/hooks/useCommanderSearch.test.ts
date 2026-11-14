import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SEARCH_DEBOUNCE_MS } from '../constants';

const search = vi.fn();
vi.mock('../scryfall/searchCommanders', () => ({ searchCommanders: (...a: unknown[]) => search(...a) }));

const { useCommanderSearch } = await import('./useCommanderSearch');

beforeEach(() => {
  vi.useFakeTimers();
  search.mockReset();
});
afterEach(() => vi.useRealTimers());

const settle = () => act(async () => void (await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)));

describe('useCommanderSearch', () => {
  it('waits for typing to pause and searches once', async () => {
    search.mockResolvedValue(['Atraxa, Grand Unifier']);
    const { result, rerender } = renderHook(({ q }) => useCommanderSearch(q), { initialProps: { q: 'at' } });
    rerender({ q: 'atr' });
    rerender({ q: 'atra' });
    await settle();
    expect(search).toHaveBeenCalledOnce();
    expect(search.mock.calls[0][0]).toBe('atra');
    expect(result.current).toEqual({ names: ['Atraxa, Grand Unifier'], error: null });
  });

  it('does not search one letter and clears results when the box is emptied', async () => {
    search.mockResolvedValue(['Kenrith']);
    const { result, rerender } = renderHook(({ q }) => useCommanderSearch(q), { initialProps: { q: 'ken' } });
    await settle();
    expect(result.current.names).toEqual(['Kenrith']);
    rerender({ q: 'k' });
    await settle();
    expect(result.current.names).toEqual([]);
    expect(search).toHaveBeenCalledOnce();
  });

  it('keeps the last results up while a new search is pending', async () => {
    search.mockResolvedValueOnce(['Kenrith']).mockResolvedValueOnce(['Kenrith, the Returned King']);
    const { result, rerender } = renderHook(({ q }) => useCommanderSearch(q), { initialProps: { q: 'ken' } });
    await settle();
    rerender({ q: 'kenr' });
    expect(result.current.names).toEqual(['Kenrith']);
    await settle();
    expect(result.current.names).toEqual(['Kenrith, the Returned King']);
  });

  it('says when the search fails', async () => {
    search.mockRejectedValue(new Error('Scryfall 500'));
    const { result } = renderHook(() => useCommanderSearch('atra'));
    await settle();
    expect(result.current).toEqual({ names: [], error: 'Search failed — offline?' });
  });
});

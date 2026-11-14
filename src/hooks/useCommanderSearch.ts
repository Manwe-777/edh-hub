import { useEffect, useState } from 'react';

import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '../constants';
import { searchCommanders } from '../scryfall/searchCommanders';

interface Result {
  names: string[];
  error: string | null;
}
const EMPTY: Result = { names: [], error: null };

/** Debounced commander search; results stay up while typing until new ones arrive. */
export function useCommanderSearch(q: string): Result {
  const [result, setResult] = useState<Result>(EMPTY);
  const short = q.trim().length < SEARCH_MIN_CHARS;
  if (short && result !== EMPTY) setResult(EMPTY);

  useEffect(() => {
    if (short) return;
    const ac = new AbortController();

    const t = window.setTimeout(() => {
      searchCommanders(q, ac.signal).then(
        (names) => setResult({ names, error: null }),
        (e: Error) => e.name !== 'AbortError' && setResult({ names: [], error: 'Search failed — offline?' }),
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [q, short]);

  return short ? EMPTY : result;
}

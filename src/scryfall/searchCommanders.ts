import { SEARCH_MAX_RESULTS, SEARCH_MIN_CHARS } from '../constants';
import { nameMatchRank } from '../utils/nameMatchRank';
import { scryfallGet } from './scryfallGet';

/** Names of cards that can be a commander, best name match first, most played within each group. */
export async function searchCommanders(q: string, signal?: AbortSignal): Promise<string[]> {
  const needle = q.trim().toLowerCase();
  if (needle.length < SEARCH_MIN_CHARS) return [];
  const query = encodeURIComponent(`${q.trim()} is:commander`);

  try {
    const r = await scryfallGet<{ data: { name: string }[] }>(
      `/cards/search?q=${query}&order=edhrec&unique=cards`,
      signal,
    );

    return r.data
      .map((c, i) => ({ name: c.name, i, r: nameMatchRank(c.name, needle) }))
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .slice(0, SEARCH_MAX_RESULTS)
      .map((c) => c.name);
  } catch (e) {
    if (e instanceof Error && e.message === 'Scryfall 404') return []; // no matches
    throw e;
  }
}

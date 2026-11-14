import { SCRYFALL_API, SCRYFALL_GAP_MS } from '../constants';

let nextSlot = 0;

/** GET from the Scryfall API, spacing requests at least SCRYFALL_GAP_MS apart. Throws `Scryfall <status>` on errors. */
export async function scryfallGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = now + wait + SCRYFALL_GAP_MS;
  if (wait) await new Promise((r) => setTimeout(r, wait));
  const res = await fetch(SCRYFALL_API + path, { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Scryfall ${res.status}`);
  return res.json() as Promise<T>;
}

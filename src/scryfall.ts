// Scryfall API: https://scryfall.com/docs/api — keep requests spaced >= 100 ms.
const API = 'https://api.scryfall.com';
const GAP_MS = 100;
let nextSlot = 0;

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = now + wait + GAP_MS;
  if (wait) await new Promise((r) => setTimeout(r, wait));
  const res = await fetch(API + path, { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Scryfall ${res.status}`);
  return res.json() as Promise<T>;
}

/** Cards that can be a commander (legendary creatures, plus the few cards that say so). */
export async function searchCommanders(q: string, signal?: AbortSignal): Promise<string[]> {
  if (q.trim().length < 2) return [];
  const query = encodeURIComponent(`${q.trim()} is:commander`);
  try {
    const r = await get<{ data: { name: string }[] }>(`/cards/search?q=${query}&order=edhrec&unique=cards`, signal);
    // Best name match first (start of name, then start of a word), most played within each group.
    const needle = q.trim().toLowerCase();
    const rank = (name: string) => {
      const n = name.toLowerCase();
      if (n.startsWith(needle)) return 0;
      if (n.split(/[\s,'-]+/).some((w) => w.startsWith(needle))) return 1;
      return n.includes(needle) ? 2 : 3;
    };
    return r.data
      .map((c, i) => ({ name: c.name, i, r: rank(c.name) }))
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .slice(0, 10)
      .map((c) => c.name);
  } catch (e) {
    if (e instanceof Error && e.message === 'Scryfall 404') return []; // no matches
    throw e;
  }
}

export interface ArtOption {
  key: string;
  art: string;
  artist: string;
  label: string;
}

interface Card {
  id: string;
  name: string;
  set_name: string;
  artist?: string;
  image_uris?: { art_crop: string };
  card_faces?: { name: string; artist?: string; image_uris?: { art_crop: string } }[];
}

/** Every distinct artwork for an exact card name (double-faced cards give one option per face). */
export async function artworks(name: string, signal?: AbortSignal): Promise<ArtOption[]> {
  const q = encodeURIComponent(`!"${name}" unique:art`);
  const r = await get<{ data: Card[] }>(`/cards/search?q=${q}&order=released`, signal);
  const out: ArtOption[] = [];
  for (const c of r.data) {
    if (c.image_uris?.art_crop) {
      out.push({ key: c.id, art: c.image_uris.art_crop, artist: c.artist ?? '', label: c.set_name });
    } else {
      c.card_faces?.forEach((f, i) => {
        if (f.image_uris?.art_crop) {
          out.push({
            key: `${c.id}-${i}`,
            art: f.image_uris.art_crop,
            artist: f.artist ?? c.artist ?? '',
            label: `${c.set_name} · ${i === 0 ? 'front' : 'back'}`,
          });
        }
      });
    }
  }
  return out;
}

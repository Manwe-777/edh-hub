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

export async function autocomplete(q: string, signal?: AbortSignal): Promise<string[]> {
  if (q.trim().length < 2) return [];
  const r = await get<{ data: string[] }>(`/cards/autocomplete?q=${encodeURIComponent(q)}`, signal);
  return r.data.slice(0, 8);
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

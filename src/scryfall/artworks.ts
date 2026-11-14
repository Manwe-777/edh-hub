import type { ArtOption, ScryfallCard } from '../types';
import { cardArtOptions } from './cardArtOptions';
import { scryfallGet } from './scryfallGet';

/** Every distinct artwork for an exact card name. */
export async function artworks(name: string, signal?: AbortSignal): Promise<ArtOption[]> {
  const q = encodeURIComponent(`!"${name}" unique:art`);
  const r = await scryfallGet<{ data: ScryfallCard[] }>(`/cards/search?q=${q}&order=released`, signal);
  return r.data.flatMap(cardArtOptions);
}

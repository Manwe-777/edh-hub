import type { ArtOption, ScryfallCard } from '../types';

/** A printing's artwork, or one per face for double-faced cards. */
export function cardArtOptions(c: ScryfallCard): ArtOption[] {
  if (c.image_uris?.art_crop) {
    return [{ key: c.id, art: c.image_uris.art_crop, artist: c.artist ?? '', label: c.set_name }];
  }
  return (c.card_faces ?? []).flatMap((f, i) =>
    f.image_uris?.art_crop
      ? [
          {
            key: `${c.id}-${i}`,
            art: f.image_uris.art_crop,
            artist: f.artist ?? c.artist ?? '',
            label: `${c.set_name} · ${i === 0 ? 'front' : 'back'}`,
          },
        ]
      : [],
  );
}

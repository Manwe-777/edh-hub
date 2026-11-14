import { afterEach, describe, expect, it, vi } from 'vitest';

import { artworks } from './artworks';
import { searchCommanders } from './searchCommanders';

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async (_url: string) => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('searchCommanders', () => {
  it('does not search for fewer than two letters', async () => {
    const fetch = mockFetch(200, { data: [] });
    expect(await searchCommanders(' a ')).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('only asks for cards that can be commanders', async () => {
    const fetch = mockFetch(200, { data: [] });
    await searchCommanders('atra');
    const url = decodeURIComponent(fetch.mock.calls[0][0]);
    expect(url).toContain('atra is:commander');
  });

  it('puts names starting with the query first, then word matches, keeping popularity order within each', async () => {
    mockFetch(200, {
      data: [
        { name: 'Kutzil, Malamet Exemplar' },
        { name: "Atraxa, Praetors' Voice" },
        { name: 'Ghave, Guru of Spores' },
        { name: 'Queen Atrapa' },
        { name: 'Atraxa, Grand Unifier' },
      ],
    });

    expect(await searchCommanders('atra')).toEqual([
      "Atraxa, Praetors' Voice",
      'Atraxa, Grand Unifier',
      'Queen Atrapa',
      'Kutzil, Malamet Exemplar',
      'Ghave, Guru of Spores',
    ]);
  });

  it('returns at most 10 names', async () => {
    mockFetch(200, { data: Array.from({ length: 15 }, (_, i) => ({ name: `Card ${i}` })) });
    expect(await searchCommanders('card')).toHaveLength(10);
  });

  it('treats "not found" as no results', async () => {
    mockFetch(404, { object: 'error' });
    expect(await searchCommanders('zzzz')).toEqual([]);
  });

  it('reports other failures', async () => {
    mockFetch(500, {});
    await expect(searchCommanders('atra')).rejects.toThrow('Scryfall 500');
  });
});

describe('artworks', () => {
  it('gives one option per printing, and one per face for double-faced cards', async () => {
    mockFetch(200, {
      data: [
        { id: 'a', name: 'X', set_name: 'Alpha', artist: 'Ann', image_uris: { art_crop: 'a.jpg' } },
        {
          id: 'b',
          name: 'X',
          set_name: 'Beta',
          artist: 'Bob',
          card_faces: [
            { name: 'Front', image_uris: { art_crop: 'f.jpg' } },
            { name: 'Back', artist: 'Cy', image_uris: { art_crop: 'k.jpg' } },
          ],
        },
      ],
    });

    expect(await artworks('X')).toEqual([
      { key: 'a', art: 'a.jpg', artist: 'Ann', label: 'Alpha' },
      { key: 'b-0', art: 'f.jpg', artist: 'Bob', label: 'Beta · front' },
      { key: 'b-1', art: 'k.jpg', artist: 'Cy', label: 'Beta · back' },
    ]);
  });
});

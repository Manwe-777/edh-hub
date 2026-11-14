import { useState } from 'react';

import { useCommanderSearch } from '../../hooks/useCommanderSearch';
import { usePins } from '../../pins/usePins';
import { artworks } from '../../scryfall/artworks';
import { mutate } from '../../store/mutate';
import type { ArtOption, Commander, Game } from '../../types';
import { UiIcon } from '../icons/UiIcon';
import { ArtGrid } from './ArtGrid';
import { CurrentCommander } from './CurrentCommander';
import { NameList } from './NameList';

interface Props {
  game: Game;
  id: number;
  slot: 0 | 1;
}

/** Search a commander by name, then pick one of its artworks. Pinned commanders show when not searching. */
export function CommanderPicker({ game, id, slot }: Props) {
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [arts, setArts] = useState<ArtOption[] | null>(null);
  const [artErr, setArtErr] = useState<string | null>(null);
  const search = useCommanderSearch(q);
  const pins = usePins();
  const setCommander = (c: Commander) => mutate((g) => void (g.players[id].commanders[slot] = c), false);

  const pickName = (name: string) => {
    setPicked(name);
    setQ('');
    setArts(null);
    setArtErr(null);
    artworks(name).then(setArts, () => setArtErr('Could not load artworks'));
  };
  const pickArt = (a: ArtOption) => {
    setCommander({ name: picked!, art: a.art, artist: a.artist });
    setArts(null);
    setPicked(null);
  };

  const searching = q.trim().length >= 2;
  // Pinned ones first, then Scryfall's order (most played).
  const names = searching
    ? [...search.names.filter((n) => pins.includes(n)), ...search.names.filter((n) => !pins.includes(n))]
    : picked
      ? []
      : pins;
  const err = search.error ?? artErr;

  return (
    <div className="cmdr">
      <CurrentCommander
        cmd={game.players[id].commanders[slot]}
        slot={slot}
        pins={pins}
        onClear={() => setCommander({ name: '', art: null, artist: null })}
      />
      <label className="search">
        <UiIcon name="search" size={18} />
        <input placeholder="Search commanders…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {names.length > 0 && <NameList names={names} pins={pins} onPick={pickName} />}
      {picked && !arts && !err && <div className="muted">Loading artworks for {picked}…</div>}
      {arts && <ArtGrid arts={arts} onPick={pickArt} />}
      {err && <div className="err">{err}</div>}
    </div>
  );
}

import { useState } from 'react';

import type { Game } from '../../game/Game';
import { useCommanderSearch } from '../../hooks/useCommanderSearch';
import { usePins } from '../../pins/usePins';
import { artworks } from '../../scryfall/artworks';
import { mutate } from '../../store/mutate';
import type { ArtOption, Commander } from '../../types';
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
  const setCommander = (c: Commander) => mutate((g) => g.players[id].setCommander(slot, c), false);

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
    <div className="mt-3 flex flex-col gap-2.5 rounded-2xl bg-surface p-3">
      <CurrentCommander
        cmd={game.players[id].commanders[slot]}
        slot={slot}
        pins={pins}
        onClear={() => mutate((g) => g.players[id].clearCommander(slot), false)}
      />
      <label className="relative block text-muted">
        <span className="pointer-events-none absolute top-[15px] left-3.5">
          <UiIcon name="search" size={18} />
        </span>
        <input
          className="bg-surface-2 pl-[42px]"
          placeholder="Search commanders…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      {names.length > 0 && <NameList names={names} pins={pins} onPick={pickName} />}
      {picked && !arts && !err && <div className="text-[13px] text-muted">Loading artworks for {picked}…</div>}
      {arts && <ArtGrid arts={arts} onPick={pickArt} />}
      {err && <div className="text-[13px] text-err">{err}</div>}
    </div>
  );
}

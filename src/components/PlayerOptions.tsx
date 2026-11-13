import { useEffect, useRef, useState } from 'react';
import {
  ALL_COUNTERS, COUNTER_LABEL, MAX_VISIBLE_COUNTERS, PALETTE,
  type CounterKey, type Dir, type Game,
} from '../game';
import { mutate } from '../store';
import { artworks, autocomplete, type ArtOption } from '../scryfall';
import { Rotated } from './Rotated';
import { isSideways } from '../layouts';
import { CounterIcon } from './icons';

/** Full-screen options panel, drawn in the player's own orientation. */
export function PlayerOptions(props: { game: Game; id: number; dir: Dir; vw: number; vh: number; onClose: () => void }) {
  const { game, id, dir, vw, vh, onClose } = props;
  const p = game.players[id];
  const set = (fn: (g: Game) => void) => mutate(fn, false);
  // Ignore the click that ends the swipe which opened this panel.
  const openedAt = useRef(Date.now());
  const backdrop = () => Date.now() - openedAt.current > 400 && onClose();

  const toggleCounter = (k: CounterKey) =>
    set((g) => {
      const v = g.players[id].visibleCounters;
      const i = v.indexOf(k);
      if (i >= 0) v.splice(i, 1);
      else if (v.length < MAX_VISIBLE_COUNTERS) v.push(k);
    });

  return (
    <div className="modal-backdrop" onClick={backdrop}>
      <Rotated w={vw} h={vh} dir={dir} className="sheet-wrap">
        <div className={`sheet${isSideways(dir) ? ' wide' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="sheet-head">
            <h2>Player options</h2>
            <button className="btn" onClick={onClose}>Done</button>
          </div>

          <div className="sheet-cols">
          <div>
          <label className="field">
            <span>Name</span>
            <input
              value={p.name}
              maxLength={24}
              onChange={(e) => set((g) => void (g.players[id].name = e.target.value))}
            />
          </label>

          <div className="field">
            <span>Color</span>
            <div className="swatches">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  className={`swatch${p.color === c ? ' on' : ''}`}
                  style={{ background: c }}
                  aria-label={c}
                  onClick={() => set((g) => void (g.players[id].color = c))}
                />
              ))}
            </div>
          </div>

          <div className="field">
            <span>Commanders</span>
            <div className="seg">
              {([1, 2] as const).map((n) => (
                <button key={n} className={`btn${p.commanderCount === n ? ' on' : ''}`} onClick={() => set((g) => void (g.players[id].commanderCount = n))}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Counters (up to {MAX_VISIBLE_COUNTERS})</span>
            <div className="counter-pick">
              {ALL_COUNTERS.map((k) => (
                <button key={k} className={`btn chip${p.visibleCounters.includes(k) ? ' on' : ''}`} onClick={() => toggleCounter(k)}>
                  <CounterIcon k={k} /> {COUNTER_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
          </div>
          <div>
          {Array.from({ length: p.commanderCount }, (_, c) => (
            <CommanderPicker key={c} game={game} id={id} slot={c as 0 | 1} />
          ))}

          </div>
          </div>
        </div>
      </Rotated>
    </div>
  );
}

function CommanderPicker({ game, id, slot }: { game: Game; id: number; slot: 0 | 1 }) {
  const cmd = game.players[id].commanders[slot];
  const [q, setQ] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [arts, setArts] = useState<ArtOption[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Debounced autocomplete.
  useEffect(() => {
    if (q.trim().length < 2) {
      setNames([]);
      return;
    }
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      autocomplete(q, ac.signal).then(setNames, (e) => e.name !== 'AbortError' && setErr('Search failed — offline?'));
    }, 300);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  const pickName = (name: string) => {
    setPicked(name);
    setNames([]);
    setQ('');
    setArts(null);
    setErr(null);
    artworks(name).then(setArts, () => setErr('Could not load artworks'));
  };

  const pickArt = (a: ArtOption) => {
    mutate((g) => void (g.players[id].commanders[slot] = { name: picked!, art: a.art, artist: a.artist }), false);
    setArts(null);
    setPicked(null);
  };

  return (
    <div className="field cmdr">
      <span>Commander {slot + 1}</span>
      <div className="cmdr-current">
        {cmd.art && <img src={cmd.art} alt="" />}
        <div>
          <div>{cmd.name || 'None'}</div>
          {cmd.artist && <div className="muted">Art by {cmd.artist}</div>}
        </div>
        {cmd.name && (
          <button className="btn" onClick={() => mutate((g) => void (g.players[id].commanders[slot] = { name: '', art: null, artist: null }), false)}>
            Clear
          </button>
        )}
      </div>
      <input placeholder="Search Scryfall…" value={q} onChange={(e) => setQ(e.target.value)} />
      {names.length > 0 && (
        <ul className="suggest">
          {names.map((n) => (
            <li key={n}><button onClick={() => pickName(n)}>{n}</button></li>
          ))}
        </ul>
      )}
      {picked && !arts && !err && <div className="muted">Loading artworks for {picked}…</div>}
      {arts && (
        <div className="arts">
          {arts.map((a) => (
            <button key={a.key} className="art-opt" onClick={() => pickArt(a)}>
              <img src={a.art} alt={a.label} loading="lazy" />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}
      {err && <div className="err">{err}</div>}
    </div>
  );
}

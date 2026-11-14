import { useEffect, useState } from 'react';

import {
  ALL_COUNTERS,
  COUNTER_LABEL,
  type CounterKey,
  type Game,
  MAX_VISIBLE_COUNTERS,
  PALETTE,
  toggleCounter,
} from '../game';
import { togglePin, usePins } from '../pins';
import { type ArtOption, artworks, searchCommanders } from '../scryfall';
import { mutate } from '../store';
import { CounterIcon, UiIcon } from './icons';

/** Full-screen options panel, always upright so the on-screen keyboard matches it. */
export function PlayerOptions(props: { game: Game; id: number; leaving: boolean; onClose: () => void }) {
  const { game, id, leaving, onClose } = props;
  const p = game.players[id];
  const set = (fn: (g: Game) => void) => mutate(fn, false);

  return (
    <div className={`screen${leaving ? ' leaving' : ''}`}>
      <div className="screen-body">
        <header className="screen-head">
          <span className="head-dot" style={{ background: p.color }} />
          <input
            className="name-input"
            value={p.name}
            maxLength={24}
            aria-label="Name"
            onChange={(e) => set((g) => void (g.players[id].name = e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <UiIcon name="close" />
          </button>
        </header>

        <section className="group">
          <h3>
            <UiIcon name="palette" size={18} /> Color
          </h3>
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
        </section>

        <section className="group">
          <h3>
            <UiIcon name="user" size={18} /> Commanders
          </h3>
          <div className="segmented" style={{ ['--n' as string]: 2 }}>
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                className={p.commanderCount === n ? 'on' : ''}
                onClick={() => set((g) => void (g.players[id].commanderCount = n))}
              >
                {n === 1 ? 'One' : 'Two (partners)'}
              </button>
            ))}
          </div>
          {Array.from({ length: p.commanderCount }, (_, c) => (
            <CommanderPicker key={c} game={game} id={id} slot={c as 0 | 1} />
          ))}
        </section>

        <section className="group">
          <h3>
            Counters <small>up to {MAX_VISIBLE_COUNTERS}</small>
          </h3>
          <CounterChips
            selected={p.visibleCounters}
            onToggle={(k) => set((g) => toggleCounter(g.players[id].visibleCounters, k))}
          />
        </section>
      </div>
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
  const pins = usePins();

  // Debounced commander search.
  useEffect(() => {
    if (q.trim().length < 2) {
      setNames([]);
      return;
    }
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      setErr(null);
      searchCommanders(q, ac.signal).then(
        setNames,
        (e) => e.name !== 'AbortError' && setErr('Search failed — offline?'),
      );
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
    <div className="cmdr">
      <div className="cmdr-current">
        {cmd.art ? <img src={cmd.art} alt="" /> : <div className="cmdr-ph" />}
        <div>
          <div>{cmd.name || `Commander ${slot + 1}`}</div>
          <div className="muted">{cmd.artist ? `Art by ${cmd.artist}` : 'No art — uses player color'}</div>
        </div>
        {cmd.name && <PinButton name={cmd.name} pinned={pins.includes(cmd.name)} />}
        {cmd.name && (
          <button
            className="icon-btn small"
            aria-label="Clear"
            onClick={() =>
              mutate((g) => void (g.players[id].commanders[slot] = { name: '', art: null, artist: null }), false)
            }
          >
            <UiIcon name="close" size={18} />
          </button>
        )}
      </div>
      <label className="search">
        <UiIcon name="search" size={18} />
        <input placeholder="Search commanders…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {q.trim().length >= 2
        ? names.length > 0 && (
            // Pinned ones first, then Scryfall's order (most played).
            <NameList
              names={[...names.filter((n) => pins.includes(n)), ...names.filter((n) => !pins.includes(n))]}
              pins={pins}
              onPick={pickName}
            />
          )
        : !picked && pins.length > 0 && <NameList names={pins} pins={pins} onPick={pickName} />}
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

function PinButton({ name, pinned }: { name: string; pinned: boolean }) {
  return (
    <button
      className={`icon-btn small pin${pinned ? ' on' : ''}`}
      aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
      aria-pressed={pinned}
      onClick={() => togglePin(name)}
    >
      <UiIcon name="star" size={18} filled={pinned} />
    </button>
  );
}

function NameList({ names, pins, onPick }: { names: string[]; pins: string[]; onPick: (n: string) => void }) {
  return (
    <ul className="suggest">
      {names.map((n) => (
        <li key={n}>
          <button className="suggest-name" onClick={() => onPick(n)}>
            {n}
          </button>
          <PinButton name={n} pinned={pins.includes(n)} />
        </li>
      ))}
    </ul>
  );
}

/** Counter on/off chips, shared by player options and the game menu's defaults. */
export function CounterChips({ selected, onToggle }: { selected: CounterKey[]; onToggle: (k: CounterKey) => void }) {
  return (
    <div className="chips">
      {ALL_COUNTERS.map((k) => (
        <button key={k} className={`chip${selected.includes(k) ? ' on' : ''}`} onClick={() => onToggle(k)}>
          <CounterIcon k={k} /> {COUNTER_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

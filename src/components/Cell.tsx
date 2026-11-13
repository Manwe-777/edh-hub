import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  type CounterKey, type Game, type Player, MANA, POOL_MANA,
  addCmdDamage, addCounter, addLife, addMana, lossCause,
} from '../game';
import { ROTATION, type Seat } from '../layouts';
import { mutate } from '../store';
import { useDefeatLine } from '../defeat';
import { usePresence } from '../usePresence';
import { Rotated, localSize } from './Rotated';
import { Press } from './PressButton';
import { CounterIcon, ManaPoolIcon, ManaSymbol } from './icons';

const GAP = 3;
const NAME_H = 24;

interface CellProps {
  game: Game;
  player: Player;
  seat: Seat;
  vw: number;
  vh: number;
  onOptions: (id: number) => void;
}

/** Running life delta shown next to the total; clears ~2 s after the last change. */
function useLifeDelta(life: number, epoch: number) {
  const prev = useRef(life);
  const prevEpoch = useRef(epoch);
  const [delta, setDelta] = useState(0);
  const timer = useRef<number>(undefined);
  useEffect(() => {
    if (epoch !== prevEpoch.current) {
      prevEpoch.current = epoch;
      prev.current = life;
      setDelta(0);
      return;
    }
    const d = life - prev.current;
    prev.current = life;
    if (!d) return;
    setDelta((x) => x + d);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDelta(0), 2000);
  }, [life, epoch]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return delta;
}

export function Cell({ game, player: p, seat, vw, vh, onOptions }: CellProps) {
  const w = seat.w * vw - GAP * 2;
  const h = seat.h * vh - GAP * 2;
  const { lw, lh } = localSize(w, h, seat.dir);
  const rotation = ROTATION[seat.dir];
  const cause = lossCause(game, p);
  const defeat = useDefeatLine(p.id, cause);
  const delta = useLifeDelta(p.life, game.epoch);

  const view = game.view;
  const inCmd = view.kind === 'cmd';
  const isTarget = inCmd && view.target === p.id;
  const manaShown = p.manaOpen && !inCmd && !game.roll;
  const mana = usePresence(manaShown, 220);

  const barH = inCmd ? 0 : Math.round(Math.max(42, Math.min(56, lh * 0.2)));
  const bodyH = lh - barH - NAME_H;
  const tallyGroups = game.cmdTally && !inCmd && !game.roll ? tallySources(game, p) : [];
  // The strip also uses the name row (the name re-centers in the space left of it).
  const tally = tallyGroups.length ? tallyLayout(tallyGroups, lh - barH - TALLY_TOP - 4, lw) : null;
  const bodyW = lw - (tally?.width ?? 0);
  const lifeFont = Math.max(28, Math.min(bodyW * 0.28, bodyH * 0.66));
  const pad = { top: NAME_H, bottom: barH };

  const swipe = (d: 'up' | 'down') => {
    if (d === 'up') mutate((g) => void (g.view = { kind: 'cmd', target: p.id }), false);
    else if (inCmd) mutate((g) => void (g.view = { kind: 'normal' }), false);
    else onOptions(p.id);
  };

  const style: CSSProperties = {
    left: seat.x * vw + GAP,
    top: seat.y * vh + GAP,
    width: w,
    height: h,
  };

  let body;
  if (game.roll) {
    body = <RollResult key={game.roll.id} game={game} p={p} font={lifeFont} />;
  } else if (inCmd && !isTarget) {
    body = <DamageControls source={p} target={game.players[view.target]} rotation={rotation} swipe={swipe} font={lifeFont} pad={pad} />;
  } else {
    body = (
      <LifeArea
        p={p}
        rotation={rotation}
        swipe={swipe}
        font={lifeFont}
        defeat={defeat}
        delta={delta}
        pad={pad}
        caption={isTarget ? 'Commander damage' : null}
      />
    );
  }

  const arts = p.commanders.slice(0, p.commanderCount).map((c) => c.art).filter(Boolean) as string[];
  const cls = [
    'cell',
    arts.length ? 'has-art' : 'plain',
    cause && 'lost',
    isTarget && 'target',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={style}>
      <Rotated w={w} h={h} dir={seat.dir} className={`cell-inner${mana.mounted ? ' mana-open' : ''}`} style={{ ['--pc' as string]: p.color }}>
        <div className="cell-bg">
          {arts.map((a, i) => (
            <div key={i} className="bg-art" style={{ backgroundImage: `url("${a}")`, width: `${100 / arts.length}%`, left: `${(100 / arts.length) * i}%` }} />
          ))}
        </div>
        <div className="cell-layer" style={tally ? { right: tally.width } : undefined}>{body}</div>
        {tally && (
          <Tally
            groups={tallyGroups}
            layout={tally}
            bottom={barH}
            rotation={rotation}
            onTap={() => mutate((g) => void (g.view = { kind: 'cmd', target: p.id }), false)}
            swipe={swipe}
          />
        )}
        {mana.mounted && <ManaOverlay p={p} lw={lw} pad={pad} leaving={mana.leaving} />}
        <div className="cell-name" style={{ height: NAME_H, paddingRight: tally?.width }}>
          {game.monarch === p.id && <span className="name-token"><CounterIcon k="monarch" /></span>}
          {game.initiative === p.id && <span className="name-token"><CounterIcon k="initiative" /></span>}
          <span className="name-text">{p.name}</span>
          {manaShown && <span className="name-life">{p.life}</span>}
          {inCmd && !isTarget && <span className="dealt">→ {game.players[view.target].name}</span>}
        </div>
        {barH > 0 && <CounterBar game={game} p={p} h={barH} lw={lw} manaMode={mana.mounted} />}
      </Rotated>
    </div>
  );
}

interface TallySquare {
  key: string;
  color: string;
  art: string | null;
  dmg: number;
}

/** Per other active player, one square per commander that has dealt damage to `p`. */
function tallySources(game: Game, p: Player): TallySquare[][] {
  const out: TallySquare[][] = [];
  for (let i = 0; i < game.playerCount; i++) {
    if (i === p.id) continue;
    const s = game.players[i];
    const squares = Array.from({ length: s.commanderCount }, (_, c) => ({
      key: `${i}-${c}`,
      color: s.color,
      art: s.commanders[c].art,
      dmg: p.cmdDamage[i][c],
    })).filter((t) => t.dmg > 0);
    if (squares.length) out.push(squares);
  }
  return out;
}

const TALLY_GAP = 5; // between opponents
const TALLY_INNER = 2; // between partner squares
const TALLY_PAD = 6;
const TALLY_TOP = 4;

/**
 * Opponents are tiles (a partner pair stays side by side in one tile) flowing
 * into 1–3 columns; picks the layout with the biggest squares that keeps the
 * strip within ~40% of the cell width.
 */
function tallyLayout(groups: TallySquare[][], h: number, lw: number) {
  const n = groups.length;
  const slots = Math.max(...groups.map((g) => g.length));
  const maxW = lw * 0.4;
  let best = { cols: 1, size: 0 };
  for (let cols = 1; cols <= 3; cols++) {
    const rows = Math.ceil(n / cols);
    const byH = (h - TALLY_GAP * (rows - 1)) / rows;
    const byW = (maxW - TALLY_PAD * 2 - (cols - 1) * TALLY_GAP - cols * (slots - 1) * TALLY_INNER) / (cols * slots);
    const size = Math.floor(Math.min(36, byH, byW));
    if (size > best.size) best = { cols, size };
  }
  const size = Math.max(16, best.size);
  const tileW = slots * size + (slots - 1) * TALLY_INNER;
  return { cols: best.cols, size, tileW, width: best.cols * tileW + (best.cols - 1) * TALLY_GAP + TALLY_PAD * 2 };
}

function Tally(props: {
  groups: TallySquare[][]; layout: ReturnType<typeof tallyLayout>; bottom: number; rotation: number;
  onTap: () => void; swipe: (d: 'up' | 'down') => void;
}) {
  const { groups, layout, bottom, rotation, onTap, swipe } = props;
  return (
    <Press
      className="tally"
      rotation={rotation}
      onTap={onTap}
      onSwipe={swipe}
      label="Commander damage taken"
      style={{
        top: TALLY_TOP,
        bottom,
        width: layout.width,
        gridTemplateColumns: `repeat(${layout.cols}, ${layout.tileW}px)`,
        gridAutoRows: layout.size,
        gap: TALLY_GAP,
        padding: `0 ${TALLY_PAD}px`,
      }}
    >
      {groups.map((g) => (
        <div key={g[0].key} className="tally-tile" style={{ gap: TALLY_INNER }}>
          {g.map((t) => (
            <div
              key={t.key}
              className={`tally-sq${t.dmg >= 21 ? ' lethal' : ''}`}
              style={{
                width: layout.size,
                background: t.art ? `center 30% / cover url("${t.art}")` : t.color,
                fontSize: Math.max(10, layout.size * 0.44),
              }}
            >
              <span>{t.dmg}</span>
            </div>
          ))}
        </div>
      ))}
    </Press>
  );
}

interface Pad {
  top: number;
  bottom: number;
}

function LifeArea(props: {
  p: Player; rotation: number; swipe: (d: 'up' | 'down') => void; font: number;
  defeat: string | null; delta: number; caption: string | null; pad: Pad;
}) {
  const { p, rotation, swipe, font, defeat, delta, caption, pad } = props;
  const change = (n: number) => () => mutate((g) => addLife(g, p.id, n));
  return (
    <>
      <Press className="half left" rotation={rotation} onTap={change(-1)} onHold={change(-10)} onSwipe={swipe} label="Lose life">
        <span className="pm">−</span>
      </Press>
      <Press className="half right" rotation={rotation} onTap={change(1)} onHold={change(10)} onSwipe={swipe} label="Gain life">
        <span className="pm">+</span>
      </Press>
      <div className="life-wrap" style={{ top: pad.top, bottom: pad.bottom }}>
        {caption && <div className="caption">{caption}</div>}
        {defeat ? (
          <div key={defeat} className="defeat" style={{ fontSize: Math.max(20, font * 0.34) }}>{defeat}</div>
        ) : (
          <div className="life" style={{ fontSize: font }}>
            {p.life}
            {delta !== 0 && (
              <span className="delta" style={{ fontSize: Math.max(18, font * 0.34) }}>
                {delta > 0 ? `+${delta}` : `−${-delta}`}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/** In a commander-damage view: what this cell's commanders dealt to the target. */
function DamageControls(props: {
  source: Player; target: Player; rotation: number;
  swipe: (d: 'up' | 'down') => void; font: number; pad: Pad;
}) {
  const { source: s, target: t, rotation, swipe, font, pad } = props;
  const dmg = t.cmdDamage[s.id];
  const change = (c: 0 | 1, n: number) => () => mutate((g) => addCmdDamage(g, t.id, s.id, c, n));

  if (s.commanderCount === 1) {
    return (
      <>
        <Press className="half left" rotation={rotation} onTap={change(0, -1)} onHold={change(0, -10)} onSwipe={swipe} label="Remove damage">
          <span className="pm from-left">−</span>
        </Press>
        <Press className="half right" rotation={rotation} onTap={change(0, 1)} onHold={change(0, 10)} onSwipe={swipe} label="Add damage">
          <span className="pm from-right">+</span>
        </Press>
        <div className="life-wrap" style={{ top: pad.top, bottom: pad.bottom }}>
          <div className={`life dmg pop-in${dmg[0] >= 21 ? ' lethal' : ''}`} style={{ fontSize: font }}>
            <i className="ms ms-commander" />{dmg[0]}
          </div>
        </div>
      </>
    );
  }

  const col = (c: 0 | 1) => (
    <div className={`dmg-col from-${c === 0 ? 'left' : 'right'}`}>
      <div className="dmg-row">
        <Press className="sq-btn" rotation={rotation} onTap={change(c, -1)} onHold={change(c, -10)} onSwipe={swipe} label="Remove damage">−</Press>
        <div className={`dmg-num${dmg[c] >= 21 ? ' lethal' : ''}`} style={{ fontSize: Math.min(font * 0.55, 56) }}>{dmg[c]}</div>
        <Press className="sq-btn" rotation={rotation} onTap={change(c, 1)} onHold={change(c, 10)} onSwipe={swipe} label="Add damage">+</Press>
      </div>
      <div className="dmg-name">{s.commanders[c].name || `Commander ${c + 1}`}</div>
    </div>
  );
  return (
    <Press className="dmg-two" rotation={rotation} onSwipe={swipe} style={{ paddingTop: pad.top, paddingBottom: pad.bottom }}>
      <div className="dmg-cols">
        {col(0)}
        {col(1)}
      </div>
    </Press>
  );
}

/** Grid shapes for the mana entries; picks whichever gives the largest buttons. */
function manaLayout(n: number, w: number, h: number) {
  const g = 6;
  const label = 30; // count + symbol line
  const shapes = [
    { cols: n, rows: 1, row: false },
    { cols: Math.ceil(n / 2), rows: 2, row: false },
    { cols: 2, rows: Math.ceil(n / 2), row: true },
    { cols: Math.ceil(n / 2), rows: 2, row: true },
  ].map((o) => {
    const colW = (w - g * (o.cols - 1)) / o.cols;
    const rowH = (h - g * (o.rows - 1)) / o.rows;
    // vertical entry: + above, label, − below; row entry: − label +
    const btn = o.row ? Math.min((colW - 64) / 2, rowH) : Math.min(colW, (rowH - label - 4) / 2);
    return { ...o, btn };
  });
  const best = shapes.reduce((a, b) => (b.btn > a.btn ? b : a));
  return { ...best, btn: Math.floor(Math.max(28, Math.min(56, best.btn))) };
}

function ManaOverlay({ p, lw, pad, leaving }: { p: Player; lw: number; pad: Pad; leaving: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => setH(ref.current?.clientHeight ?? 0), []);
  const { cols, rows, row, btn } = manaLayout(POOL_MANA.length, lw - 16, Math.max(0, h - pad.top - pad.bottom - 8));
  const change = (c: (typeof MANA)[number], n: number) => () => mutate((g) => addMana(g, p.id, c, n));
  const minus = (c: (typeof MANA)[number]) => (
    <Press className="sq-btn bare" style={{ width: btn, height: btn }} onTap={change(c, -1)} label={`Remove ${c}`}>−</Press>
  );
  const plus = (c: (typeof MANA)[number]) => (
    <Press className="sq-btn bare" style={{ width: btn, height: btn }} onTap={change(c, 1)} label={`Add ${c}`}>+</Press>
  );
  return (
    <div ref={ref} className={`mana-shade${leaving ? ' leaving' : ''}`}>
      {h > 0 && (
        <div
          className="mana"
          style={{
            top: pad.top,
            bottom: pad.bottom,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {POOL_MANA.map((c) => (
            <div key={c} className={`mana-entry${row ? ' row' : ''}`}>
              {row ? minus(c) : plus(c)}
              <div className="mana-count" style={{ fontSize: Math.max(16, Math.min(24, btn * 0.48)) }}>
                <span>{p.mana[c]}</span>
                <ManaSymbol c={c} />
              </div>
              {row ? plus(c) : minus(c)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CounterBar({ game, p, h, lw, manaMode }: { game: Game; p: Player; h: number; lw: number; manaMode: boolean }) {
  const items: (CounterKey | 'mana')[] = [...p.visibleCounters, 'mana'];
  const size = Math.min(h - 4, lw / items.length - 6);
  return (
    <div className={`bar${manaMode ? ' mana-mode' : ''}`} style={{ height: h }}>
      {items.map((k) => (
        <CounterButton key={k} game={game} p={p} k={k} size={size} />
      ))}
    </div>
  );
}

function CounterButton({ game, p, k, size }: { game: Game; p: Player; k: CounterKey | 'mana'; size: number }) {
  const style = { width: size, height: size, fontSize: size * 0.56 };
  if (k === 'mana') {
    const total = POOL_MANA.reduce((a, c) => a + p.mana[c], 0);
    return (
      <Press
        className={`ctr ctr-mana${p.manaOpen ? ' on' : ''}`}
        style={style}
        label="Mana pool"
        onTap={() => mutate((g) => void (g.players[p.id].manaOpen = !g.players[p.id].manaOpen), false)}
        onHold={() => mutate((g) => MANA.forEach((c) => (g.players[p.id].mana[c] = 0)))}
        repeat={false}
      >
        <ManaPoolIcon />
        {total > 0 && <span className="badge">{total}</span>}
      </Press>
    );
  }
  if (k === 'monarch' || k === 'initiative') {
    const held = game[k] === p.id;
    return (
      <Press
        className={`ctr${held ? ' on' : ''}`}
        style={style}
        label={k}
        onTap={() => mutate((g) => void (g[k] = p.id))}
        onHold={() => mutate((g) => void (g[k] === p.id && (g[k] = null)))}
        repeat={false}
      >
        <CounterIcon k={k} />
      </Press>
    );
  }
  const v = p.counters[k];
  return (
    <Press
      className={`ctr ctr-${k}${v > 0 ? ' on' : ''}${k === 'poison' && v >= 10 ? ' lethal' : ''}`}
      style={style}
      label={k}
      onTap={() => mutate((g) => addCounter(g, p.id, k, 1))}
      onHold={() => mutate((g) => addCounter(g, p.id, k, -1))}
    >
      <CounterIcon k={k} />
      {v > 0 && <span className="badge">{v}</span>}
    </Press>
  );
}

const SPIN_MS = 2000;

/** Flickers random d20 faces, slowing down, then settles on `final`. */
function useSpin(final: number) {
  const [value, setValue] = useState(() => 1 + Math.floor(Math.random() * 20));
  const [done, setDone] = useState(false);
  useEffect(() => {
    let elapsed = 0;
    let delay = 45;
    let timer = 0;
    const step = () => {
      elapsed += delay;
      if (elapsed >= SPIN_MS) {
        setValue(final);
        setDone(true);
        return;
      }
      setValue((v) => {
        let n = v;
        while (n === v) n = 1 + Math.floor(Math.random() * 20);
        return n;
      });
      delay = 45 + 320 * (elapsed / SPIN_MS) ** 2;
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, delay);
    return () => window.clearTimeout(timer);
  }, [final]);
  return { value, done };
}

function RollResult({ game, p, font }: { game: Game; p: Player; font: number }) {
  const roll = game.roll!;
  const mine = roll.rounds.map((r) => r[p.id]).filter((v): v is number => v !== null);
  const win = roll.winner === p.id;
  const { value, done } = useSpin(mine[mine.length - 1]);
  return (
    <Press
      className={`roll${done ? ' settled' : ''}${done && win ? ' win' : ''}`}
      onTap={() => mutate((g) => void (g.roll = null), false)}
      label="Dismiss roll"
    >
      {done && win && <div className="winner-fx" />}
      <div className={`roll-val${done ? ' pop-in' : ''}`} style={{ fontSize: font * 0.8 }}>
        {value}
      </div>
      <div className="roll-hist">{done && mine.length > 1 ? `tie-break: ${mine.join(' → ')}` : '\u00a0'}</div>
    </Press>
  );
}

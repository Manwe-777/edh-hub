import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  type CounterKey, type Game, type Player, MANA,
  addCmdDamage, addCounter, addLife, addMana, lossCause,
} from '../game';
import { ROTATION, type Seat } from '../layouts';
import { mutate } from '../store';
import { useDefeatLine } from '../defeat';
import { Rotated, localSize } from './Rotated';
import { Press } from './PressButton';
import { CounterIcon, ManaPoolIcon, ManaSymbol } from './icons';

const GAP = 3;

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

const inCmdView = (g: Game) => g.view.kind === 'cmd';

export function Cell({ game, player: p, seat, vw, vh, onOptions }: CellProps) {
  const w = seat.w * vw - GAP * 2;
  const h = seat.h * vh - GAP * 2;
  const { lw, lh } = localSize(w, h, seat.dir);
  const rotation = ROTATION[seat.dir];
  const cause = lossCause(game, p);
  const defeat = useDefeatLine(p.id, cause);
  const delta = useLifeDelta(p.life, game.epoch);

  const barH = inCmdView(game) ? 0 : Math.round(Math.max(42, Math.min(56, lh * 0.2)));
  const bodyH = lh - barH - 22;
  const lifeFont = Math.max(28, Math.min(lw * 0.28, bodyH * 0.62));

  const view = game.view;
  const inCmd = view.kind === 'cmd';
  const isTarget = inCmd && view.target === p.id;

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
    body = <RollResult game={game} p={p} font={lifeFont} />;
  } else if (inCmd && !isTarget) {
    body = <DamageControls game={game} source={p} target={game.players[view.target]} rotation={rotation} swipe={swipe} font={lifeFont} lw={lw} />;
  } else if (p.manaOpen && !inCmd) {
    body = <ManaOverlay p={p} lw={lw} lh={lh - barH - 22} />;
  } else {
    body = (
      <LifeArea
        p={p}
        rotation={rotation}
        swipe={swipe}
        font={lifeFont}
        defeat={defeat}
        delta={delta}
        caption={isTarget ? 'Commander damage' : null}
      />
    );
  }

  const arts = p.commanders.slice(0, p.commanderCount).map((c) => c.art).filter(Boolean) as string[];

  return (
    <div className={`cell${cause ? ' lost' : ''}${isTarget ? ' target' : ''}${game.roll?.winner === p.id ? ' winner' : ''}`} style={style}>
      <Rotated w={w} h={h} dir={seat.dir} className="cell-inner" style={{ ['--pc' as string]: p.color }}>
        <div className="cell-bg">
          {arts.length === 0 && <div className="bg-color" />}
          {arts.map((a, i) => (
            <div key={i} className="bg-art" style={{ backgroundImage: `url("${a}")`, width: `${100 / arts.length}%`, left: `${(100 / arts.length) * i}%` }} />
          ))}
          <div className="bg-scrim" />
        </div>
        <div className="cell-name" style={{ height: 22 }}>
          {game.monarch === p.id && <span className="name-token"><CounterIcon k="monarch" /></span>}
          {game.initiative === p.id && <span className="name-token"><CounterIcon k="initiative" /></span>}
          {p.name}
          {p.manaOpen && !inCmd && <span className="name-life">· {p.life} life</span>}
          {inCmd && !isTarget && <span className="dealt">→ {game.players[view.target].name}</span>}
        </div>
        <div className="cell-body" style={{ top: 22, bottom: barH }}>
          {body}
        </div>
        {barH > 0 && <CounterBar game={game} p={p} h={barH} lw={lw} />}
      </Rotated>
    </div>
  );
}

function LifeArea(props: {
  p: Player; rotation: number; swipe: (d: 'up' | 'down') => void; font: number;
  defeat: string | null; delta: number; caption: string | null;
}) {
  const { p, rotation, swipe, font, defeat, delta, caption } = props;
  const change = (n: number) => () => mutate((g) => addLife(g, p.id, n));
  return (
    <>
      <Press className="half left" rotation={rotation} onTap={change(-1)} onHold={change(-10)} onSwipe={swipe} label="Lose life">
        <span className="pm">−</span>
      </Press>
      <Press className="half right" rotation={rotation} onTap={change(1)} onHold={change(10)} onSwipe={swipe} label="Gain life">
        <span className="pm">+</span>
      </Press>
      <div className="life-wrap">
        {caption && <div className="caption"><i className="ms ms-commander" /> {caption}</div>}
        {defeat ? (
          <>
            <div key={defeat} className="defeat" style={{ fontSize: Math.max(18, font * 0.32) }}>
              <i className="ms ms-counter-skull" /> {defeat}
            </div>
            <div className="life small" style={{ fontSize: font * 0.4 }}>{p.life}</div>
          </>
        ) : (
          <div className="life" style={{ fontSize: font }}>{p.life}</div>
        )}
        {delta !== 0 && (
          <div className="delta" style={{ fontSize: Math.max(14, font * 0.22) }}>
            {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </div>
    </>
  );
}

/** In a commander-damage view: what this cell's commanders dealt to the target. */
function DamageControls(props: {
  game: Game; source: Player; target: Player; rotation: number;
  swipe: (d: 'up' | 'down') => void; font: number; lw: number;
}) {
  const { source: s, target: t, rotation, swipe, font } = props;
  const dmg = t.cmdDamage[s.id];
  const change = (c: 0 | 1, n: number) => () => mutate((g) => addCmdDamage(g, t.id, s.id, c, n));

  if (s.commanderCount === 1) {
    return (
      <>
        <Press className="half left" rotation={rotation} onTap={change(0, -1)} onHold={change(0, -10)} onSwipe={swipe} label="Remove damage">
          <span className="pm">−</span>
        </Press>
        <Press className="half right" rotation={rotation} onTap={change(0, 1)} onHold={change(0, 10)} onSwipe={swipe} label="Add damage">
          <span className="pm">+</span>
        </Press>
        <div className="life-wrap">
          <div className={`life dmg${dmg[0] >= 21 ? ' lethal' : ''}`} style={{ fontSize: font }}>
            <i className="ms ms-commander" />{dmg[0]}
          </div>
        </div>
      </>
    );
  }

  const col = (c: 0 | 1) => (
    <div className="dmg-col">
      <div className="dmg-row">
        <Press className="sq-btn" rotation={rotation} onTap={change(c, -1)} onHold={change(c, -10)} onSwipe={swipe} label="Remove damage">−</Press>
        <div className={`dmg-num${dmg[c] >= 21 ? ' lethal' : ''}`} style={{ fontSize: Math.min(font * 0.55, 56) }}>{dmg[c]}</div>
        <Press className="sq-btn" rotation={rotation} onTap={change(c, 1)} onHold={change(c, 10)} onSwipe={swipe} label="Add damage">+</Press>
      </div>
      <div className="dmg-name">{s.commanders[c].name || `Commander ${c + 1}`}</div>
    </div>
  );
  return (
    <Press className="dmg-two" rotation={rotation} onSwipe={swipe}>
      <div className="dmg-cols">
        {col(0)}
        {col(1)}
      </div>
    </Press>
  );
}

/** Grid shapes for the six mana entries; picks whichever gives the largest buttons. */
function manaLayout(w: number, h: number) {
  const g = 6;
  const label = 30; // count + symbol line
  const opts = [
    { cols: 6, rows: 1, row: false },
    { cols: 3, rows: 2, row: false },
    { cols: 2, rows: 3, row: true },
    { cols: 3, rows: 2, row: true },
  ].map((o) => {
    const colW = (w - g * (o.cols - 1)) / o.cols;
    const rowH = (h - g * (o.rows - 1)) / o.rows;
    // vertical entry: + above, label, − below; row entry: − label +
    const btn = o.row ? Math.min((colW - 64) / 2, rowH) : Math.min(colW, (rowH - label - 4) / 2);
    return { ...o, btn };
  });
  const best = opts.reduce((a, b) => (b.btn > a.btn ? b : a));
  return { ...best, btn: Math.floor(Math.max(28, Math.min(56, best.btn))) };
}

function ManaOverlay({ p, lw, lh }: { p: Player; lw: number; lh: number }) {
  const { cols, rows, row, btn } = manaLayout(lw - 16, lh - 8);
  const change = (c: (typeof MANA)[number], n: number) => () => mutate((g) => addMana(g, p.id, c, n));
  const minus = (c: (typeof MANA)[number]) => (
    <Press className="sq-btn" style={{ width: btn, height: btn }} onTap={change(c, -1)} label={`Remove ${c}`}>−</Press>
  );
  const plus = (c: (typeof MANA)[number]) => (
    <Press className="sq-btn" style={{ width: btn, height: btn }} onTap={change(c, 1)} label={`Add ${c}`}>+</Press>
  );
  return (
    <div className="mana" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {MANA.map((c) => (
        <div key={c} className={`mana-entry${row ? ' row' : ''}`}>
          {row ? minus(c) : plus(c)}
          <div className="mana-count" style={{ fontSize: Math.max(14, Math.min(22, btn * 0.45)) }}>
            <span>{p.mana[c]}</span><span className="x">x</span><ManaSymbol c={c} />
          </div>
          {row ? plus(c) : minus(c)}
        </div>
      ))}
    </div>
  );
}

function CounterBar({ game, p, h, lw }: { game: Game; p: Player; h: number; lw: number }) {
  const items: (CounterKey | 'mana')[] = [...p.visibleCounters, 'mana'];
  const size = Math.min(h - 4, lw / items.length - 6);
  return (
    <div className="bar" style={{ height: h }}>
      {items.map((k) => (
        <CounterButton key={k} game={game} p={p} k={k} size={size} />
      ))}
    </div>
  );
}

function CounterButton({ game, p, k, size }: { game: Game; p: Player; k: CounterKey | 'mana'; size: number }) {
  const style = { width: size, height: size, fontSize: size * 0.56 };
  if (k === 'mana') {
    const total = Object.values(p.mana).reduce((a, b) => a + b, 0);
    return (
      <Press
        className={`ctr${p.manaOpen ? ' on' : ''}`}
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
      className={`ctr${v > 0 ? ' on' : ''}${k === 'poison' && v >= 10 ? ' lethal' : ''}`}
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

function RollResult({ game, p, font }: { game: Game; p: Player; font: number }) {
  const roll = game.roll!;
  const mine = roll.rounds.map((r) => r[p.id]).filter((v): v is number => v !== null);
  const win = roll.winner === p.id;
  return (
    <Press className="roll" onTap={() => mutate((g) => void (g.roll = null), false)} label="Dismiss roll">
      <div className="roll-val" style={{ fontSize: font * 0.8 }}>
        <i className="ms ms-ability-d20" /> {mine[mine.length - 1]}
      </div>
      {mine.length > 1 && <div className="roll-hist">{mine.join(' → ')}</div>}
      <div className="roll-tag">{win ? 'Highest roll — you start!' : ' '}</div>
    </Press>
  );
}

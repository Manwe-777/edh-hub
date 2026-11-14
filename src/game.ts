export type Dir = 'd' | 'u' | 'l' | 'r';
export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
export const MANA: ManaColor[] = ['W', 'U', 'B', 'R', 'G', 'C'];
/** Colors shown in the mana pool overlay. */
export const POOL_MANA: ManaColor[] = ['W', 'U', 'B', 'R', 'G'];

/** Numeric counters a player can track. `tax2` is the second commander's tax, shown with `tax` for partners. */
export type NumericCounter = 'poison' | 'experience' | 'energy' | 'rad' | 'tax' | 'tax2' | 'storm';
/** Single-holder tokens: only one player holds each at a time. */
export type TokenCounter = 'monarch' | 'initiative';
export type CounterKey = NumericCounter | TokenCounter;

export const NUMERIC_COUNTERS: NumericCounter[] = ['poison', 'experience', 'energy', 'rad', 'tax', 'storm'];
export const ALL_COUNTERS: CounterKey[] = ['poison', 'experience', 'monarch', 'initiative', 'energy', 'rad', 'tax', 'storm'];
export const DEFAULT_COUNTERS: CounterKey[] = ['tax', 'storm', 'poison'];
export const MAX_VISIBLE_COUNTERS = 5;

export const COUNTER_LABEL: Record<CounterKey, string> = {
  poison: 'Poison',
  experience: 'Experience',
  monarch: 'Monarch',
  initiative: 'Initiative',
  energy: 'Energy',
  rad: 'Rad',
  tax: 'Commander tax',
  tax2: 'Commander tax (second commander)',
  storm: 'Storm',
};

/** Bright, slightly pastel cell colors; text and icons on them are black. */
export const PALETTE = [
  '#4f8fe8', '#ec5f57', '#34b46e', '#9a6ff0', '#f0922e', '#22aea4',
  '#e7609f', '#7d8796', '#c9a043', '#6f78ee',
];
/** First palette, mapped index-for-index onto the current one when loading old saves. */
const OLD_PALETTES = [
  ['#2f6fb3', '#b8423a', '#2f8f55', '#7b4bb0', '#c27c1a', '#1f8f8a', '#b2457f', '#5a6472', '#8a6d3b', '#3c3f99'],
  ['#8ab8f0', '#f4978e', '#8fd9a8', '#c3a6ef', '#f7c77e', '#7fd6cf', '#f4a6cb', '#c9d1db', '#e3cf9f', '#a9adf5'],
];
const paletteIndex = (c: string) => Math.max(...OLD_PALETTES.map((pal) => pal.indexOf(c)));

export interface Commander {
  name: string;
  art: string | null;
  artist: string | null;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  commanderCount: 1 | 2;
  commanders: [Commander, Commander];
  life: number;
  /** cmdDamage[sourceId] = [damage from source's commander 1, from commander 2] */
  cmdDamage: [number, number][];
  counters: Record<NumericCounter, number>;
  visibleCounters: CounterKey[];
  mana: Record<ManaColor, number>;
  manaOpen: boolean;
}

export interface Roll {
  /** Identifies this roll so the cells replay the spin once per roll. */
  id: number;
  /** rounds[r][playerId] = value rolled, or null if that player didn't roll that round */
  rounds: (number | null)[][];
  winner: number;
}

export type View = { kind: 'normal' } | { kind: 'cmd'; target: number };

export interface Game {
  version: 1;
  playerCount: number;
  startingLife: number;
  keepAwake: boolean;
  /** Show a per-commander damage tally on the right edge of each cell. */
  cmdTally: boolean;
  players: Player[];
  monarch: number | null;
  initiative: number | null;
  view: View;
  roll: Roll | null;
  /** Bumped on resets so transient UI (life change bubbles) can clear. */
  epoch: number;
}

export const MAX_PLAYERS = 6;

const emptyCommander = (): Commander => ({ name: '', art: null, artist: null });
const zeroCounters = (): Record<NumericCounter, number> =>
  ({ poison: 0, experience: 0, energy: 0, rad: 0, tax: 0, tax2: 0, storm: 0 });
const zeroMana = (): Record<ManaColor, number> => ({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 });
const zeroDamage = (): [number, number][] => Array.from({ length: MAX_PLAYERS }, () => [0, 0]);

export function newPlayer(id: number, life: number): Player {
  return {
    id,
    name: `Player ${id + 1}`,
    color: PALETTE[id % PALETTE.length],
    commanderCount: 1,
    commanders: [emptyCommander(), emptyCommander()],
    life,
    cmdDamage: zeroDamage(),
    counters: zeroCounters(),
    visibleCounters: [...DEFAULT_COUNTERS],
    mana: zeroMana(),
    manaOpen: false,
  };
}

export function newGame(): Game {
  return {
    version: 1,
    playerCount: 4,
    startingLife: 40,
    keepAwake: true,
    cmdTally: false,
    players: Array.from({ length: MAX_PLAYERS }, (_, i) => newPlayer(i, 40)),
    monarch: null,
    initiative: null,
    view: { kind: 'normal' },
    roll: null,
    epoch: 0,
  };
}

// ---- rules (all mutate the draft passed in) ----

export const isActive = (g: Game, id: number) => id < g.playerCount;

export type LossCause = 'life' | 'poison' | 'cmd';

export function lossCause(g: Game, p: Player): LossCause | null {
  if (p.life <= 0) return 'life';
  if (p.counters.poison >= 10) return 'poison';
  for (let s = 0; s < g.playerCount; s++) {
    if (s === p.id) continue;
    const src = g.players[s];
    const d = p.cmdDamage[s];
    if (d[0] >= 21 || (src.commanderCount === 2 && d[1] >= 21)) return 'cmd';
  }
  return null;
}

export function addLife(g: Game, id: number, delta: number) {
  g.players[id].life += delta;
}

/** Commander damage also moves life: +1 damage = -1 life, removing damage gives it back. */
export function addCmdDamage(g: Game, target: number, source: number, cmd: 0 | 1, delta: number) {
  const t = g.players[target];
  const cur = t.cmdDamage[source][cmd];
  const next = Math.max(0, cur + delta);
  t.cmdDamage[source][cmd] = next;
  t.life -= next - cur;
}

export function addCounter(g: Game, id: number, key: NumericCounter, delta: number) {
  const c = g.players[id].counters;
  c[key] = Math.max(0, c[key] + delta);
}

export function addMana(g: Game, id: number, color: ManaColor, delta: number) {
  const m = g.players[id].mana;
  m[color] = Math.max(0, m[color] + delta);
}

/** Every seat back to a fresh player (default name, counters, one commander, no art) with distinct random colors; also resets the game. */
export function resetPlayers(g: Game) {
  const colors = [...PALETTE];
  for (let i = colors.length - 1; i > 0; i--) {
    const j = d(i + 1) - 1;
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  g.players = g.players.map((_, i) => ({ ...newPlayer(i, g.startingLife), color: colors[i % colors.length] }));
  resetGame(g);
}

export function resetGame(g: Game) {
  for (const p of g.players) {
    p.life = g.startingLife;
    p.cmdDamage = zeroDamage();
    p.counters = zeroCounters();
    p.mana = zeroMana();
    p.manaOpen = false;
  }
  g.monarch = null;
  g.initiative = null;
  g.view = { kind: 'normal' };
  g.roll = null;
  g.epoch++;
}

function d(n: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return 1 + (a[0] % n);
}
export const rollDie = d;

/** Everyone rolls a d20; ties re-roll among the tied players until one is highest. */
export function rollHigh(g: Game) {
  let contenders = Array.from({ length: g.playerCount }, (_, i) => i);
  const rounds: (number | null)[][] = [];
  for (;;) {
    const r: (number | null)[] = Array(MAX_PLAYERS).fill(null);
    for (const i of contenders) r[i] = d(20);
    rounds.push(r);
    const max = Math.max(...contenders.map((i) => r[i]!));
    const tops = contenders.filter((i) => r[i] === max);
    if (tops.length === 1) {
      g.roll = { id: Date.now(), rounds, winner: tops[0] };
      return;
    }
    contenders = tops;
  }
}

/** Validates a parsed save and upgrades older shapes. Throws if unusable. */
export function migrate(raw: unknown): Game {
  const g = raw as Game;
  if (!g || typeof g !== 'object' || g.version !== 1) throw new Error('unknown save version');
  if (!Array.isArray(g.players) || g.players.length !== MAX_PLAYERS) throw new Error('bad players');
  const base = newGame();
  const out: Game = { ...base, ...g };
  out.players = g.players.map((p, i) => {
    const np = newPlayer(i, g.startingLife ?? 40);
    const old = paletteIndex(p.color);
    return {
      ...np,
      ...p,
      color: old >= 0 ? PALETTE[old] : p.color,
      counters: { ...np.counters, ...(p.counters ?? {}) },
      mana: { ...np.mana, ...(p.mana ?? {}) },
      cmdDamage: Array.isArray(p.cmdDamage) && p.cmdDamage.length === MAX_PLAYERS ? p.cmdDamage : np.cmdDamage,
    };
  });
  if (typeof out.playerCount !== 'number' || out.playerCount < 2 || out.playerCount > MAX_PLAYERS) out.playerCount = 4;
  return out;
}

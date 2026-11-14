import {
  DEFAULT_COUNTERS,
  DEFAULT_LIFE,
  DEFAULT_PLAYER_COUNT,
  LETHAL_CMD_DAMAGE,
  LETHAL_POISON,
  MAX_PLAYERS,
  PALETTE,
  ROLL_DIE,
} from '../constants';
import type {
  CounterKey,
  GameData,
  LossCause,
  ManaColor,
  NumericCounter,
  Roll,
  TallySquare,
  TokenCounter,
  View,
} from '../types';
import { rollDie } from '../utils/rollDie';
import { shuffle } from '../utils/shuffle';
import { Player } from './Player';

/** Whether a parsed value has the shape of a saved game this version can read. */
const isSave = (raw: unknown): raw is GameData => {
  const g = raw as GameData | null;
  return (
    !!g && typeof g === 'object' && g.version === 1 && Array.isArray(g.players) && g.players.length === MAX_PLAYERS
  );
};

/** What a player's cell shows, given the current view. */
export interface CellView {
  /** A commander damage view is open. */
  inCmd: boolean;
  /** This player is the one whose damage taken is shown. */
  isTarget: boolean;
  /** The mana pool is open and nothing covers it. */
  manaShown: boolean;
  /** Damage tally squares to show (none when the tally is off or a view covers the table). */
  tally: TallySquare[][];
}

/** The whole table: settings, all six seats (the first `playerCount` play), tokens, and the current view. */
export class Game implements GameData {
  readonly version = 1;
  playerCount = DEFAULT_PLAYER_COUNT;
  startingLife = DEFAULT_LIFE;
  keepAwake = true;
  cmdTally = false;
  defaultCounters: CounterKey[] = [...DEFAULT_COUNTERS];
  players: Player[] = Array.from({ length: MAX_PLAYERS }, (_, i) => new Player(i, DEFAULT_LIFE));
  monarch: number | null = null;
  initiative: number | null = null;
  view: View = { kind: 'normal' };
  roll: Roll | null = null;
  epoch = 0;

  /** Validates a parsed save and upgrades older shapes. Throws if unusable. */
  static fromSave(raw: unknown): Game {
    if (!isSave(raw)) throw new Error('unreadable save');
    const g = Object.assign(new Game(), raw);
    g.players = raw.players.map((p, i) => Player.fromSave(p, i, raw.startingLife ?? DEFAULT_LIFE));
    if (!Array.isArray(g.defaultCounters)) g.defaultCounters = [...DEFAULT_COUNTERS];
    const n = g.playerCount;
    if (typeof n !== 'number' || n < 2 || n > MAX_PLAYERS) g.playerCount = DEFAULT_PLAYER_COUNT;
    return g;
  }

  toJSON(): GameData {
    return { ...this, players: this.players.map((p) => p.toJSON()) };
  }

  /** An independent copy, for changing without touching this one. */
  clone(): Game {
    return Game.fromSave(structuredClone(this.toJSON()));
  }

  // ---- changes ----

  addLife(id: number, delta: number) {
    this.players[id].addLife(delta);
  }

  addCmdDamage(target: number, source: number, cmd: 0 | 1, delta: number) {
    this.players[target].takeCmdDamage(source, cmd, delta);
  }

  addCounter(id: number, key: NumericCounter, delta: number) {
    this.players[id].addCounter(key, delta);
  }

  addMana(id: number, color: ManaColor, delta: number) {
    this.players[id].addMana(color, delta);
  }

  /** Gives the monarch or initiative to a player (taking it from whoever had it). */
  claimToken(token: TokenCounter, id: number) {
    this[token] = id;
  }

  /** A player gives up the monarch or initiative; nobody holds it afterwards. */
  dropToken(token: TokenCounter, id: number) {
    if (this[token] === id) this[token] = null;
  }

  /** Changes the player count, leaving a damage view for a seat that's gone and clearing any roll. */
  setPlayerCount(n: number) {
    this.playerCount = n;
    if (this.view.kind === 'cmd' && this.view.target >= n) this.view = { kind: 'normal' };
    this.roll = null;
  }

  showDamageTo(id: number) {
    this.view = { kind: 'cmd', target: id };
  }

  /** Back to the normal table: closes a damage view and dismisses a roll. */
  showTable() {
    this.view = { kind: 'normal' };
    this.roll = null;
  }

  /** New game with the same players: life, damage, counters, mana and tokens back to the start. */
  reset() {
    for (const p of this.players) p.resetForGame(this.startingLife);
    this.monarch = null;
    this.initiative = null;
    this.showTable();
    this.epoch++;
  }

  /** Every seat back to a fresh player (default name, one commander, the default counters) with distinct random colors; also resets the game. */
  resetPlayers() {
    const colors = shuffle(PALETTE);

    this.players = this.players.map((_, i) => {
      const p = new Player(i, this.startingLife);
      p.color = colors[i % colors.length];
      p.visibleCounters = [...this.defaultCounters];
      return p;
    });

    this.reset();
  }

  /** Everyone rolls a d20; ties re-roll among the tied players until one is highest. */
  rollHigh() {
    let contenders = Array.from({ length: this.playerCount }, (_, i) => i);
    const rounds: (number | null)[][] = [];

    for (;;) {
      const r: (number | null)[] = Array(MAX_PLAYERS).fill(null);
      for (const i of contenders) r[i] = rollDie(ROLL_DIE);
      rounds.push(r);
      const max = Math.max(...contenders.map((i) => r[i]!));
      const tops = contenders.filter((i) => r[i] === max);

      if (tops.length === 1) {
        this.roll = { id: Date.now(), rounds, winner: tops[0] };
        return;
      }

      contenders = tops;
    }
  }

  // ---- queries ----

  /** Why `p` has lost, or null while they're still in the game. */
  lossCause(p: Player): LossCause | null {
    if (p.life <= 0) return 'life';
    if (p.counters.poison >= LETHAL_POISON) return 'poison';

    for (let s = 0; s < this.playerCount; s++) {
      if (s === p.id) continue;
      const counted = p.cmdDamage[s].slice(0, this.players[s].commanderCount);
      if (counted.some((d) => d >= LETHAL_CMD_DAMAGE)) return 'cmd';
    }

    return null;
  }

  /** Per other active player, one square per commander that has dealt damage to `p`; players with none are left out. */
  tallySources(p: Player): TallySquare[][] {
    const out: TallySquare[][] = [];

    for (let i = 0; i < this.playerCount; i++) {
      if (i === p.id) continue;
      const s = this.players[i];

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

  /** What a player's cell shows, given the current view. */
  cellView(p: Player): CellView {
    const view = this.view;
    const inCmd = view.kind === 'cmd';
    const overlay = inCmd || !!this.roll;
    return {
      inCmd,
      isTarget: inCmd && view.target === p.id,
      manaShown: p.manaOpen && !overlay,
      tally: this.cmdTally && !overlay ? this.tallySources(p) : [],
    };
  }
}

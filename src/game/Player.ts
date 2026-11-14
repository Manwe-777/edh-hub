import { DEFAULT_COUNTERS, MAX_PLAYERS, OLD_PALETTES, PALETTE, POOL_MANA } from '../constants';
import type { BarItem, Commander, CounterKey, ManaColor, NumericCounter, PlayerData } from '../types';

const emptyCommander = (): Commander => ({ name: '', art: null, artist: null });

const zeroCounters = (): Record<NumericCounter, number> => ({
  poison: 0,
  experience: 0,
  energy: 0,
  rad: 0,
  tax: 0,
  tax2: 0,
  storm: 0,
});

const zeroMana = (): Record<ManaColor, number> => ({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 });
const zeroDamage = (): [number, number][] => Array.from({ length: MAX_PLAYERS }, () => [0, 0]);
/** Index of a color in any earlier palette, or -1. */
const oldPaletteIndex = (color: string) => Math.max(...OLD_PALETTES.map((pal) => pal.indexOf(color)));

/** One seat at the table: who sits there, their commanders, and everything they're tracking. */
export class Player implements PlayerData {
  id: number;
  name: string;
  color: string;
  commanderCount: 1 | 2 = 1;
  commanders: [Commander, Commander] = [emptyCommander(), emptyCommander()];
  life: number;
  cmdDamage = zeroDamage();
  counters = zeroCounters();
  visibleCounters: CounterKey[] = [...DEFAULT_COUNTERS];
  mana = zeroMana();
  manaOpen = false;

  constructor(id: number, life: number) {
    this.id = id;
    this.name = `Player ${id + 1}`;
    this.color = PALETTE[id % PALETTE.length];
    this.life = life;
  }

  /** A saved player, with fields added since filled in and old palette colors mapped to the current ones. */
  static fromSave(saved: PlayerData, id: number, startingLife: number): Player {
    const p = Object.assign(new Player(id, startingLife), saved);
    const old = oldPaletteIndex(saved.color);
    if (old >= 0) p.color = PALETTE[old];
    p.counters = { ...zeroCounters(), ...(saved.counters ?? {}) };
    p.mana = { ...zeroMana(), ...(saved.mana ?? {}) };
    if (!Array.isArray(saved.cmdDamage) || saved.cmdDamage.length !== MAX_PLAYERS) p.cmdDamage = zeroDamage();
    return p;
  }

  toJSON(): PlayerData {
    return { ...this };
  }

  addLife(delta: number) {
    this.life += delta;
  }

  /** Commander damage also moves life: +1 damage = -1 life, removing damage gives it back. */
  takeCmdDamage(source: number, cmd: 0 | 1, delta: number) {
    const cur = this.cmdDamage[source][cmd];
    const next = Math.max(0, cur + delta);
    this.cmdDamage[source][cmd] = next;
    this.life -= next - cur;
  }

  addCounter(key: NumericCounter, delta: number) {
    this.counters[key] = Math.max(0, this.counters[key] + delta);
  }

  addMana(color: ManaColor, delta: number) {
    this.mana[color] = Math.max(0, this.mana[color] + delta);
  }

  clearMana() {
    this.mana = zeroMana();
  }

  /** Back to the start of a game: life, damage, counters and mana; name, color and commanders stay. */
  resetForGame(life: number) {
    this.life = life;
    this.cmdDamage = zeroDamage();
    this.counters = zeroCounters();
    this.mana = zeroMana();
    this.manaOpen = false;
  }

  /** Mana floating in the pool. */
  get poolTotal(): number {
    return POOL_MANA.reduce((a, c) => a + this.mana[c], 0);
  }

  /** Art of the commanders in play, in order; commanders without art are skipped. */
  get arts(): string[] {
    return this.commanders
      .slice(0, this.commanderCount)
      .map((c) => c.art)
      .filter((a): a is string => !!a);
  }

  /** Counter bar buttons: the chosen counters (partners get a second tax button), then the mana pool. */
  get barItems(): BarItem[] {
    const partners = this.commanderCount === 2;
    return [
      ...this.visibleCounters.flatMap((k): CounterKey[] => (k === 'tax' && partners ? ['tax', 'tax2'] : [k])),
      'mana',
    ];
  }

  setCommander(slot: 0 | 1, c: Commander) {
    this.commanders[slot] = c;
  }

  clearCommander(slot: 0 | 1) {
    this.commanders[slot] = emptyCommander();
  }
}

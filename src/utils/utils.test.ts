import { afterEach, describe, expect, it, vi } from 'vitest';

import { cx } from './cx';
import { formatDelta } from './formatDelta';
import { localSize } from './localSize';
import { nameMatchRank } from './nameMatchRank';
import { nextDefeatLine } from './nextDefeatLine';
import { parsePhoneParam } from './parsePhoneParam';
import { readJson } from './readJson';
import { rollDie } from './rollDie';
import { shuffle } from './shuffle';
import { swipeDirection } from './swipeDirection';
import { versionLabel } from './versionLabel';
import { writeStorage } from './writeStorage';

afterEach(() => localStorage.clear());

describe('rollDie and shuffle', () => {
  it('rolls every face of a die and nothing else', () => {
    const seen = new Set(Array.from({ length: 2000 }, () => rollDie(6)));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('shuffles into a permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('small formatters', () => {
  it('cx keeps only real class names', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('formatDelta signs changes with a real minus', () => {
    expect(formatDelta(3)).toBe('+3');
    expect(formatDelta(-12)).toBe('−12');
  });

  it('versionLabel prefixes release versions only', () => {
    expect(versionLabel('1.3.0')).toBe('v1.3.0');
    expect(versionLabel('dev')).toBe('dev');
  });
});

describe('localSize', () => {
  it('swaps width and height for players sitting on the sides', () => {
    expect(localSize(100, 300, 'l')).toEqual({ lw: 300, lh: 100 });
    expect(localSize(100, 300, 'r')).toEqual({ lw: 300, lh: 100 });
    expect(localSize(100, 300, 'u')).toEqual({ lw: 100, lh: 300 });
  });
});

describe('swipeDirection', () => {
  it('reads a vertical swipe for an upright player', () => {
    expect(swipeDirection(0, -80, 0)).toBe('up');
    expect(swipeDirection(5, 80, 0)).toBe('down');
  });

  it('maps screen motion into a rotated player frame', () => {
    // Player on the left edge (content rotated 90° clockwise): their "up" is screen right.
    expect(swipeDirection(80, 0, 90)).toBe('up');
    expect(swipeDirection(-80, 0, 90)).toBe('down');
    // Player across the table: everything is upside down.
    expect(swipeDirection(0, 80, 180)).toBe('up');
  });

  it('ignores short or mostly sideways moves', () => {
    expect(swipeDirection(0, 30, 0)).toBeNull();
    expect(swipeDirection(90, 50, 0)).toBeNull();
  });
});

describe('nameMatchRank', () => {
  it('ranks start of name, then start of a word, then anywhere', () => {
    expect(nameMatchRank("Atraxa, Praetors' Voice", 'atra')).toBe(0);
    expect(nameMatchRank('Ixhel, Scion of Atraxa', 'atra')).toBe(1);
    expect(nameMatchRank('Hapatra, Vizier', 'atra')).toBe(2);
    expect(nameMatchRank('Kutzil', 'atra')).toBe(3);
  });
});

describe('nextDefeatLine', () => {
  it('skips lines other players are showing and removes the one it takes', () => {
    const bag = ['Bolted', 'Exiled', 'Fizzled'];
    expect(nextDefeatLine(bag, new Set(['Bolted']))).toBe('Exiled');
    expect(bag).toEqual(['Bolted', 'Fizzled']);
  });

  it('repeats a line rather than show nothing', () => {
    const bag = ['Bolted'];
    expect(nextDefeatLine(bag, new Set(['Bolted']))).toBe('Bolted');
    expect(nextDefeatLine(bag, new Set())).toBeNull();
  });
});

describe('parsePhoneParam', () => {
  it('is off without ?phone, a default size with it, or the given size', () => {
    expect(parsePhoneParam('')).toBeNull();
    expect(parsePhoneParam('?phone')).toEqual({ vw: 412, vh: 892 });
    expect(parsePhoneParam('?phone=360x780')).toEqual({ vw: 360, vh: 780 });
  });
});

describe('storage helpers', () => {
  it('round-trips JSON and falls back on missing or corrupt values', () => {
    expect(readJson('k', 5)).toBe(5);
    writeStorage('k', JSON.stringify({ a: 1 }));
    expect(readJson('k', null)).toEqual({ a: 1 });
    writeStorage('k', '{oops');
    expect(readJson('k', 'fallback')).toBe('fallback');
  });

  it('reports a failed write instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(writeStorage('k', 'v')).toBe(false);
  });
});

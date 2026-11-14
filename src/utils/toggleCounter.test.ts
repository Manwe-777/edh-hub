import { describe, expect, it } from 'vitest';

import { MAX_VISIBLE_COUNTERS } from '../constants';
import { toggleCounter } from './toggleCounter';

describe('toggleCounter', () => {
  it('adds and removes a counter', () => {
    const list = ['tax' as const] as Parameters<typeof toggleCounter>[0];
    toggleCounter(list, 'storm');
    expect(list).toEqual(['tax', 'storm']);
    toggleCounter(list, 'tax');
    expect(list).toEqual(['storm']);
  });

  it('stops adding at the limit', () => {
    const list: Parameters<typeof toggleCounter>[0] = ['tax', 'storm', 'poison', 'energy', 'rad'];
    expect(list).toHaveLength(MAX_VISIBLE_COUNTERS);
    toggleCounter(list, 'monarch');
    expect(list).not.toContain('monarch');
  });
});

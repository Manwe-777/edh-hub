import { beforeEach, describe, expect, it, vi } from 'vitest';

async function freshPins() {
  vi.resetModules();
  const mod = await import('./pins');
  const { act, renderHook } = await import('@testing-library/react');
  const hook = renderHook(() => mod.usePins());
  const togglePin = (name: string) => act(() => mod.togglePin(name));
  return { togglePin, current: () => hook.result.current };
}

beforeEach(() => localStorage.clear());

describe('pinned commanders', () => {
  it('pins in alphabetical order and unpins', async () => {
    const { togglePin, current } = await freshPins();
    togglePin('Kenrith');
    togglePin('Atraxa');
    expect(current()).toEqual(['Atraxa', 'Kenrith']);
    togglePin('Kenrith');
    expect(current()).toEqual(['Atraxa']);
  });

  it('survives a reload', async () => {
    (await freshPins()).togglePin('Edgar Markov');
    expect((await freshPins()).current()).toEqual(['Edgar Markov']);
  });

  it('ignores corrupt saved data', async () => {
    localStorage.setItem('edh-hub/pinned-commanders', '{"a":1}');
    expect((await freshPins()).current()).toEqual([]);
    localStorage.setItem('edh-hub/pinned-commanders', '["Atraxa", 3, null]');
    expect((await freshPins()).current()).toEqual(['Atraxa']);
  });
});

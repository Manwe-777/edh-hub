import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Game } from '../game/Game';

/** The store loads from localStorage when imported, so each test imports a fresh copy. */
async function freshStore() {
  vi.resetModules();

  const [{ mutate }, { undo }, { useStore }] = await Promise.all([
    import('./mutate'),
    import('./undo'),
    import('./useStore'),
  ]);

  return { mutate, undo, useStore };
}

/** Reads the current store state through its own hook. */
async function readState(mod: Awaited<ReturnType<typeof freshStore>>) {
  const { renderHook } = await import('@testing-library/react');
  return renderHook(() => mod.useStore()).result.current;
}

beforeEach(() => localStorage.clear());

describe('store', () => {
  it('starts a new game when nothing is saved', async () => {
    const s = await readState(await freshStore());
    expect(s.game).toEqual(new Game());
    expect(s.undo).toEqual([]);
  });

  it('saves every change and loads it back', async () => {
    const a = await freshStore();
    a.mutate((g) => void (g.players[0].life = 7));
    const b = await readState(await freshStore());
    expect(b.game.players[0].life).toBe(7);
  });

  it('undo restores the game before the last change and returns to the normal view', async () => {
    const mod = await freshStore();
    mod.mutate((g) => void (g.players[0].life = 30));

    mod.mutate((g) => {
      g.players[0].life = 20;
      g.view = { kind: 'cmd', target: 0 };
    });

    mod.undo();
    const s = await readState(mod);
    expect(s.game.players[0].life).toBe(30);
    expect(s.game.view).toEqual({ kind: 'normal' });
  });

  it('changes marked not undoable are not undo steps', async () => {
    const mod = await freshStore();
    mod.mutate((g) => void (g.players[0].life = 30));
    mod.mutate((g) => void (g.view = { kind: 'cmd', target: 1 }), false);
    expect((await readState(mod)).undo).toHaveLength(1);
    mod.undo();
    expect((await readState(mod)).game.players[0].life).toBe(40);
  });

  it('keeps the last 20 undo steps', async () => {
    const mod = await freshStore();
    for (let i = 1; i <= 25; i++) mod.mutate((g) => void (g.players[0].life = i));
    const s = await readState(mod);
    expect(s.undo).toHaveLength(20);
    expect(s.undo[0].players[0].life).toBe(5);
  });

  it('undo with nothing to undo does nothing', async () => {
    const mod = await freshStore();
    mod.undo();
    expect((await readState(mod)).game).toEqual(new Game());
  });

  it('backs up an unreadable save and starts fresh', async () => {
    localStorage.setItem('edh-hub/state', '{not json');
    const s = await readState(await freshStore());
    expect(s.game).toEqual(new Game());
    expect(localStorage.getItem('edh-hub/state-backup')).toBe('{not json');
  });

  it('drops unreadable undo entries but keeps the game', async () => {
    const game = new Game();
    game.players[0].life = 11;
    localStorage.setItem('edh-hub/state', JSON.stringify({ game, undo: [new Game(), { version: 99 }] }));
    const s = await readState(await freshStore());
    expect(s.game.players[0].life).toBe(11);
    expect(s.undo).toHaveLength(1);
  });
});

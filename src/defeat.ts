import { useEffect, useRef, useState } from 'react';
import type { LossCause } from './game';

const ANY = [
  'Phased out', 'Mana screwed', 'Annihilated', 'No blockers', 'Countered', 'Exiled',
  'Board wiped', 'Sacrificed', 'Stuck on three lands', 'Flooded out', 'Tapped out',
  'Summoning sick', 'Fizzled', 'Bounced', 'Topdecked a land', 'Mulliganed to oblivion',
  'Wrathed', 'Plowshared', 'Cascaded into nothing', "Archenemy'd", 'Kept a one-lander',
  'Left the battlefield', 'Gone to the graveyard', 'Removed from the game',
  "Didn't draw the combo", 'Held up mana for nothing',
];

const BY_CAUSE: Record<LossCause, string[]> = {
  life: ['Bolted', 'Lethal on board', 'Drained out', 'Life total: no'],
  poison: ['Infected', 'Proliferated to death', 'Compleated'],
  cmd: ["Voltron'd", 'Commander says hi', 'Met the general', 'Suited up and smacked'],
};

const ROTATE_MS = 6000;

/** Lines currently on screen, per player, so two lost players never show the same one. */
const showing = new Map<number, string>();

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** A rotating defeat line for a lost player, or null while they're alive. */
export function useDefeatLine(playerId: number, cause: LossCause | null): string | null {
  const bag = useRef<string[]>([]);
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    if (!cause) {
      showing.delete(playerId);
      setLine(null);
      return;
    }
    const pool = [...ANY, ...BY_CAUSE[cause]];
    bag.current = shuffle(pool);
    const next = () => {
      const taken = new Set([...showing].filter(([id]) => id !== playerId).map(([, l]) => l));
      if (!bag.current.length) bag.current = shuffle(pool);
      let i = bag.current.findIndex((l) => !taken.has(l));
      if (i < 0) i = 0;
      const [l] = bag.current.splice(i, 1);
      showing.set(playerId, l);
      setLine(l);
    };
    next();
    const t = window.setInterval(next, ROTATE_MS);
    return () => {
      window.clearInterval(t);
      showing.delete(playerId);
    };
  }, [playerId, cause]);

  return line;
}

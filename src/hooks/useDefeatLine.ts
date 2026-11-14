import { useEffect, useState } from 'react';

import { DEFEAT_LINES, DEFEAT_LINES_BY_CAUSE, DEFEAT_ROTATE_MS } from '../constants';
import type { LossCause } from '../types';
import { nextDefeatLine } from '../utils/nextDefeatLine';
import { shuffle } from '../utils/shuffle';

/** Lines currently on screen, per player, so two lost players never show the same one. */
const showing = new Map<number, string>();

/** A rotating defeat line for a lost player, or null while they're alive. */
export function useDefeatLine(playerId: number, cause: LossCause | null): string | null {
  const [shown, setShown] = useState<{ cause: LossCause; line: string } | null>(null);

  useEffect(() => {
    if (!cause) return;
    const pool = [...DEFEAT_LINES, ...DEFEAT_LINES_BY_CAUSE[cause]];
    let bag = shuffle(pool);

    const next = () => {
      const taken = new Set([...showing].filter(([id]) => id !== playerId).map(([, l]) => l));
      if (!bag.length) bag = shuffle(pool);
      const line = nextDefeatLine(bag, taken)!;
      showing.set(playerId, line);
      setShown({ cause, line });
    };

    const first = window.setTimeout(next, 0);
    const t = window.setInterval(next, DEFEAT_ROTATE_MS);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
      showing.delete(playerId);
    };
  }, [playerId, cause]);

  return cause && shown?.cause === cause ? shown.line : null;
}

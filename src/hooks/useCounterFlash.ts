import { useEffect, useRef, useState } from 'react';

import { FLASH_FRAMES, FLASH_MS } from '../constants';
import type { NumericCounter } from '../types';

/**
 * Shows a counter's value over the life total for FLASH_MS after it changes.
 * Attach `lifeRef` to the life total so it fades out while the counter shows.
 * `flash.n` changes on every flash so the overlay can restart its animation.
 */
export function useCounterFlash() {
  const lifeRef = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState<{ k: NumericCounter; n: number } | null>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = (k: NumericCounter) => {
    setFlash((f) => ({ k, n: (f?.n ?? 0) + 1 }));
    lifeRef.current?.animate(FLASH_FRAMES, { duration: FLASH_MS, easing: 'linear' });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), FLASH_MS);
  };

  return { lifeRef, flash, show };
}

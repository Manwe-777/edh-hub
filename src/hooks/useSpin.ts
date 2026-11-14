import { useEffect, useState } from 'react';

import { ROLL_DIE, SPIN_MS } from '../constants';

const face = () => 1 + Math.floor(Math.random() * ROLL_DIE);

/** Flickers random d20 faces, slowing down, then settles on `final` after SPIN_MS. */
export function useSpin(final: number) {
  const [value, setValue] = useState(face);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let elapsed = 0;
    let delay = 45;
    let timer = 0;
    const step = () => {
      elapsed += delay;
      if (elapsed >= SPIN_MS) {
        setValue(final);
        setDone(true);
        return;
      }
      setValue((v) => {
        let n = v;
        while (n === v) n = face();
        return n;
      });
      delay = 45 + 320 * (elapsed / SPIN_MS) ** 2;
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, delay);
    return () => window.clearTimeout(timer);
  }, [final]);
  return { value, done };
}

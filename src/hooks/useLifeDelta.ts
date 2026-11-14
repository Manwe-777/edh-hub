import { useEffect, useRef, useState } from 'react';

import { LIFE_DELTA_MS } from '../constants';

/** Running life delta shown next to the total; clears LIFE_DELTA_MS after the last change and on resets. */
export function useLifeDelta(life: number, epoch: number) {
  const prev = useRef(life);
  const prevEpoch = useRef(epoch);
  const [delta, setDelta] = useState(0);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    if (epoch !== prevEpoch.current) {
      prevEpoch.current = epoch;
      prev.current = life;
      setDelta(0);
      return;
    }

    const d = life - prev.current;
    prev.current = life;
    if (!d) return;
    setDelta((x) => x + d);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDelta(0), LIFE_DELTA_MS);
  }, [life, epoch]);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return delta;
}

import { useEffect, useState } from 'react';

import { PHONE } from '../phone';
import type { Viewport } from '../types';

const read = (): Viewport => PHONE ?? { vw: window.innerWidth, vh: window.innerHeight };

/** Screen size (or the `?phone` frame size), updated on resize. */
export function useViewport(): Viewport {
  const [v, setV] = useState(read);

  useEffect(() => {
    const on = () => setV(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  return v;
}

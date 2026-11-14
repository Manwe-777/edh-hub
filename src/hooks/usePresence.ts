import { useEffect, useState } from 'react';

import { PRESENCE_MS } from '../constants';

/** Keeps something mounted for `ms` after it closes so it can animate out. */
export function usePresence(open: boolean, ms = PRESENCE_MS) {
  const [wasOpen, setWasOpen] = useState(open);
  const [leaving, setLeaving] = useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);
    setLeaving(!open);
  }

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(false), ms);
    return () => window.clearTimeout(t);
  }, [leaving, ms]);

  return { mounted: open || leaving, leaving: leaving && !open };
}

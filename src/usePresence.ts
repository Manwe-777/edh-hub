import { useEffect, useState } from 'react';

/** Keeps something mounted for `ms` after it closes so it can animate out. */
export function usePresence(open: boolean, ms = 220) {
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return { mounted: mounted || open, leaving: leaving && !open };
}

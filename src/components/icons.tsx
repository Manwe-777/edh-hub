import type { CounterKey, ManaColor } from '../game';

// The Mana font has no Monarch or Experience glyph; these are drawn to match its flat single-color style.
export function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7z" />
      <rect x="5" y="19" width="14" height="2" rx="1" />
    </svg>
  );
}

export function ExperienceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 15.4l-5.2 2.7 1-5.8L3.5 8.2l5.9-.9L12 2z" />
      <path d="M5 20h14v2H5z" />
    </svg>
  );
}

/** Mana pool: five pips in the Mana font's ms-cost colors. */
export function ManaPoolIcon() {
  const pips: [string, number, number][] = [
    ['#f0f2c0', 12, 4.5], ['#b5cde3', 19.1, 9.7], ['#db8664', 8, 19.5], ['#93b483', 4.9, 9.7], ['#aca29a', 16, 19.5],
  ];
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden>
      {pips.map(([c, x, y]) => (
        <circle key={c} cx={x} cy={y} r="3.4" fill={c} />
      ))}
    </svg>
  );
}

const MS_CLASS: Partial<Record<CounterKey, string>> = {
  poison: 'ms-p',
  energy: 'ms-e',
  rad: 'ms-counter-rad',
  tax: 'ms-commander',
  storm: 'ms-counter-flame',
  initiative: 'ms-dungeon',
};

export function CounterIcon({ k }: { k: CounterKey }) {
  if (k === 'monarch') return <CrownIcon />;
  if (k === 'experience') return <ExperienceIcon />;
  return <i className={`ms ${MS_CLASS[k]}`} aria-hidden />;
}

export function ManaSymbol({ c }: { c: ManaColor }) {
  return <i className={`ms ms-${c.toLowerCase()} ms-cost ms-shadow`} aria-hidden />;
}

/** Line icons for menus (24px grid, 2px stroke). */
const UI_PATHS = {
  close: ['M18 6 6 18', 'M6 6l12 12'],
  undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
  reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  dice: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M8 8h.01', 'M16 8h.01', 'M12 12h.01', 'M8 16h.01', 'M16 16h.01'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M6.34 17.66l-1.41 1.41', 'M19.07 4.93l-1.41 1.41'],
  expand: ['M8 3H5a2 2 0 0 0-2 2v3', 'M21 8V5a2 2 0 0 0-2-2h-3', 'M3 16v3a2 2 0 0 0 2 2h3', 'M16 21h3a2 2 0 0 0 2-2v-3'],
  user: ['M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M4 21v-1a7 7 0 0 1 14 0v1'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M21 21l-4.3-4.3'],
  github: ['M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4', 'M9 18c-4.51 2-5-2-7-2'],
  palette: ['M12 3a9 9 0 0 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.8-9-7.8z', 'M7.5 10.5h.01', 'M10.5 7h.01', 'M15 7.5h.01'],
} as const;

export type UiIconName = keyof typeof UI_PATHS;

export function UiIcon({ name, size = 22 }: { name: UiIconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {UI_PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

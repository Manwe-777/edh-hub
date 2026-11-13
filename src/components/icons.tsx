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
        <circle key={c} cx={x} cy={y} r="3.9" fill={c} stroke="rgba(0,0,0,.55)" strokeWidth="1" />
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

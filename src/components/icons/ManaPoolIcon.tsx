/** Five pips in the Mana font's ms-cost colors: [fill, cx, cy]. */
const PIPS: [string, number, number][] = [
  ['#f0f2c0', 12, 4.5],
  ['#b5cde3', 19.1, 9.7],
  ['#db8664', 8, 19.5],
  ['#93b483', 4.9, 9.7],
  ['#aca29a', 16, 19.5],
];

export function ManaPoolIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden>
      {PIPS.map(([c, x, y]) => (
        <circle key={c} cx={x} cy={y} r="3.4" fill={c} />
      ))}
    </svg>
  );
}

/**
 * Takes the next line from `bag` that isn't in `taken` (or the first one if all are),
 * removing it from the bag. Returns null for an empty bag.
 */
export function nextDefeatLine(bag: string[], taken: ReadonlySet<string>): string | null {
  if (!bag.length) return null;
  const i = Math.max(
    0,
    bag.findIndex((l) => !taken.has(l)),
  );
  return bag.splice(i, 1)[0];
}

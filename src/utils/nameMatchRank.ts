/** 0: name starts with the query, 1: a word does, 2: contains it, 3: no match. `needle` is lowercase. */
export function nameMatchRank(name: string, needle: string): number {
  const n = name.toLowerCase();
  if (n.startsWith(needle)) return 0;
  if (n.split(/[\s,'-]+/).some((w) => w.startsWith(needle))) return 1;
  return n.includes(needle) ? 2 : 3;
}

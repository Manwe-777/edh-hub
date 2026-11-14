/** A fair 1..n roll from the platform's secure random source. */
export function rollDie(n: number): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return 1 + (a[0] % n);
}

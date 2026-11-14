/** Raw localStorage value, or null when missing or storage is blocked. */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

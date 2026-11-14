/** "v1.2.3" for release versions; anything else (e.g. "dev") as is. */
export function versionLabel(version: string): string {
  return /^\d/.test(version) ? `v${version}` : version;
}

import type { Commander } from '../types';

export function emptyCommander(): Commander {
  return { name: '', art: null, artist: null };
}

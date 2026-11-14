import type { Dir } from '../types';

export function isSideways(dir: Dir): boolean {
  return dir === 'l' || dir === 'r';
}

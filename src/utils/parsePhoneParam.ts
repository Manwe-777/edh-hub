import { PHONE_SIZE } from '../constants';
import type { Viewport } from '../types';

/** `?phone` (optionally `?phone=412x892`) previews the table in a phone-sized frame on desktop. */
export function parsePhoneParam(search: string): Viewport | null {
  const v = new URLSearchParams(search).get('phone');
  if (v === null) return null;
  const m = /^(\d+)x(\d+)$/.exec(v);
  return m ? { vw: +m[1], vh: +m[2] } : PHONE_SIZE;
}

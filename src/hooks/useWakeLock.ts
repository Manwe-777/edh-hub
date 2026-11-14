import { Capacitor, registerPlugin } from '@capacitor/core';
import { useEffect } from 'react';

/** Native plugin (android/.../KeepAwakePlugin.java) that sets FLAG_KEEP_SCREEN_ON. */
const KeepAwake = registerPlugin<{ set(o: { on: boolean }): Promise<void> }>('KeepAwake');

/** Keeps the screen on while `on`: the native flag in the app, the Wake Lock API on the web. */
export function useWakeLock(on: boolean) {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      KeepAwake.set({ on }).catch(() => {});
      return;
    }
    if (!on || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let dead = false;
    const req = async () => {
      try {
        if (document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen');
        if (dead) lock?.release();
      } catch {
        /* not allowed right now */
      }
    };
    req();
    document.addEventListener('visibilitychange', req);
    return () => {
      dead = true;
      document.removeEventListener('visibilitychange', req);
      lock?.release();
    };
  }, [on]);
}

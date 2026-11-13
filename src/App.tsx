import { useEffect, useState } from 'react';
import { LAYOUTS } from './layouts';
import { mutate, useStore } from './store';
import { Cell } from './components/Cell';
import { CenterMenu } from './components/CenterMenu';
import { PlayerOptions } from './components/PlayerOptions';

/** `?phone` (optionally `?phone=412x892`) previews the table in a phone-sized frame on desktop. */
const PHONE = (() => {
  const v = new URLSearchParams(location.search).get('phone');
  if (v === null) return null;
  const m = /^(\d+)x(\d+)$/.exec(v);
  return m ? { vw: +m[1], vh: +m[2] } : { vw: 412, vh: 892 };
})();

function useViewport() {
  const read = () => PHONE ?? { vw: window.innerWidth, vh: window.innerHeight };
  const [v, setV] = useState(read);
  useEffect(() => {
    const on = () => setV(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return v;
}

function useWakeLock(on: boolean) {
  useEffect(() => {
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

export default function App() {
  const { game } = useStore();
  const { vw, vh } = useViewport();
  const [menu, setMenu] = useState(false);
  const [options, setOptions] = useState<number | null>(null);
  useWakeLock(game.keepAwake);

  const layout = LAYOUTS[game.playerCount];
  const [hx, hy] = layout.hub;
  const inCmd = game.view.kind === 'cmd';

  return (
    <div
      className={`table${PHONE ? ' phone' : ''}`}
      style={
        PHONE
          ? {
              width: vw,
              height: vh,
              transform: `translate(-50%, -50%) scale(${Math.min(1, (window.innerWidth - 16) / vw, (window.innerHeight - 16) / vh)})`,
            }
          : undefined
      }
      onContextMenu={(e) => e.preventDefault()}
    >
      {layout.seats.map((seat, i) => (
        <Cell key={i} game={game} player={game.players[i]} seat={seat} vw={vw} vh={vh} onOptions={setOptions} />
      ))}
      <button
        className={`hub${inCmd || game.roll ? ' back' : ''}`}
        style={{ left: hx * vw, top: hy * vh }}
        aria-label={inCmd || game.roll ? 'Back' : 'Menu'}
        onClick={() => {
          if (inCmd || game.roll) mutate((g) => { g.view = { kind: 'normal' }; g.roll = null; }, false);
          else setMenu(true);
        }}
      >
        {inCmd || game.roll ? '✕' : <span className="hub-icon" />}
      </button>
      {menu && <CenterMenu game={game} onClose={() => setMenu(false)} />}
      {options !== null && options < game.playerCount && (
        <PlayerOptions
          game={game}
          id={options}
          dir={layout.seats[options].dir}
          vw={vw}
          vh={vh}
          onClose={() => setOptions(null)}
        />
      )}
    </div>
  );
}

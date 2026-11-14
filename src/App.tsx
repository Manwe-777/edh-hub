import { useState } from 'react';

import { Cell } from './components/cell/Cell';
import { HubButton } from './components/HubButton';
import { CenterMenu } from './components/menu/CenterMenu';
import { PlayerOptions } from './components/player/PlayerOptions';
import { LAYOUTS } from './constants';
import { usePresence } from './hooks/usePresence';
import { useViewport } from './hooks/useViewport';
import { useWakeLock } from './hooks/useWakeLock';
import { PHONE } from './phone';
import { useStore } from './store/useStore';
import { phoneFrameStyle } from './utils/phoneFrameStyle';

export default function App() {
  const { game } = useStore();
  const viewport = useViewport();
  const [menuOpen, setMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  // Kept after closing so the panel can animate out with its content.
  const [optionsId, setOptionsId] = useState(0);
  const menu = usePresence(menuOpen);
  const options = usePresence(optionsOpen);
  useWakeLock(game.keepAwake);

  const layout = LAYOUTS[game.playerCount];

  const openOptions = (id: number) => {
    setOptionsId(id);
    setOptionsOpen(true);
  };

  return (
    <div
      className={PHONE ? 'table phone' : 'table'}
      style={PHONE ? phoneFrameStyle(PHONE, { w: window.innerWidth, h: window.innerHeight }) : undefined}
      onContextMenu={(e) => e.preventDefault()}
    >
      {layout.seats.map((seat, i) => (
        <Cell key={i} game={game} player={game.players[i]} seat={seat} viewport={viewport} onOptions={openOptions} />
      ))}
      <HubButton
        x={layout.hub[0] * viewport.vw}
        y={layout.hub[1] * viewport.vh}
        back={game.view.kind === 'cmd' || !!game.roll}
        onMenu={() => setMenuOpen(true)}
      />
      {menu.mounted && <CenterMenu game={game} leaving={menu.leaving} onClose={() => setMenuOpen(false)} />}
      {options.mounted && optionsId < game.playerCount && (
        <PlayerOptions game={game} id={optionsId} leaving={options.leaving} onClose={() => setOptionsOpen(false)} />
      )}
    </div>
  );
}

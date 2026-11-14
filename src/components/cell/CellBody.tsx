import type { Ref } from 'react';

import type { CellGeometry, Game, Player, SwipeDir } from '../../types';
import { DamageControls } from './DamageControls';
import { LifeArea } from './LifeArea';
import { RollResult } from './RollResult';

interface Props {
  game: Game;
  p: Player;
  geo: CellGeometry;
  rotation: number;
  swipe: (d: SwipeDir) => void;
  defeat: string | null;
  delta: number;
  lifeRef: Ref<HTMLDivElement>;
}

/** What the middle of a cell shows: a roll result, damage dealt to the selected player, or the life total. */
export function CellBody({ game, p, geo, rotation, swipe, defeat, delta, lifeRef }: Props) {
  const view = game.view;
  if (game.roll) return <RollResult key={game.roll.id} roll={game.roll} p={p} font={geo.lifeFont} />;
  if (view.kind === 'cmd' && view.target !== p.id) {
    return (
      <DamageControls
        source={p}
        target={game.players[view.target]}
        rotation={rotation}
        swipe={swipe}
        font={geo.lifeFont}
        pad={geo.pad}
      />
    );
  }
  return (
    <LifeArea
      p={p}
      rotation={rotation}
      swipe={swipe}
      font={geo.lifeFont}
      defeat={defeat}
      delta={delta}
      pad={geo.pad}
      wrapRef={lifeRef}
      caption={view.kind === 'cmd' ? 'Commander damage' : null}
    />
  );
}

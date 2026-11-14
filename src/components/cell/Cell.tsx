import { ROTATION } from '../../constants';
import { cellView } from '../../game/cellView';
import { commanderArts } from '../../game/commanderArts';
import { lossCause } from '../../game/lossCause';
import { useCounterFlash } from '../../hooks/useCounterFlash';
import { useDefeatLine } from '../../hooks/useDefeatLine';
import { useLifeDelta } from '../../hooks/useLifeDelta';
import { usePresence } from '../../hooks/usePresence';
import { mutate } from '../../store/mutate';
import type { Game, Player, Seat, SwipeDir, Viewport } from '../../types';
import { cellGeometry } from '../../utils/cellGeometry';
import { cx } from '../../utils/cx';
import { Rotated } from '../common/Rotated';
import { CellBackground } from './CellBackground';
import { CellBody } from './CellBody';
import { CellName } from './CellName';
import { CounterBar } from './CounterBar';
import { CounterFlash } from './CounterFlash';
import { ManaOverlay } from './ManaOverlay';
import { Tally } from './Tally';

interface Props {
  game: Game;
  player: Player;
  seat: Seat;
  viewport: Viewport;
  onOptions: (id: number) => void;
}

const showDamageTo = (id: number) => mutate((g) => void (g.view = { kind: 'cmd', target: id }), false);
const showNormal = () => mutate((g) => void (g.view = { kind: 'normal' }), false);

/** One player's area of the table, laid out in their orientation. */
export function Cell({ game, player: p, seat, viewport, onOptions }: Props) {
  const { inCmd, isTarget, manaShown, tally } = cellView(game, p);
  const cause = lossCause(game, p);
  const defeat = useDefeatLine(p.id, cause);
  const delta = useLifeDelta(p.life, game.epoch);
  const flash = useCounterFlash();
  const mana = usePresence(manaShown);
  const geo = cellGeometry(seat, viewport, !inCmd, tally);
  const rotation = ROTATION[seat.dir];
  const arts = commanderArts(p);

  const swipe = (d: SwipeDir) => {
    if (d === 'up') showDamageTo(p.id);
    else if (inCmd) showNormal();
    else onOptions(p.id);
  };

  return (
    <div
      className={cx('cell', arts.length ? 'has-art' : 'plain', cause && 'lost', isTarget && 'target')}
      style={geo.box}
    >
      <Rotated
        w={geo.box.width}
        h={geo.box.height}
        dir={seat.dir}
        className={cx('cell-inner', mana.mounted && 'mana-open')}
        style={{ ['--pc' as string]: p.color }}
      >
        <CellBackground arts={arts} />
        <div className="cell-layer" style={{ right: geo.tally?.width }}>
          <CellBody
            game={game}
            p={p}
            geo={geo}
            rotation={rotation}
            swipe={swipe}
            defeat={defeat}
            delta={delta}
            lifeRef={flash.lifeRef}
          />
          <CounterFlash key={flash.flash?.n} p={p} k={flash.flash?.k} geo={geo} />
        </div>
        <Tally
          groups={tally}
          layout={geo.tally}
          bottom={geo.barH}
          rotation={rotation}
          onTap={() => showDamageTo(p.id)}
          swipe={swipe}
        />
        {mana.mounted && <ManaOverlay p={p} lw={geo.lw} pad={geo.pad} leaving={mana.leaving} />}
        <CellName game={game} p={p} padRight={geo.tally?.width} showLife={manaShown} />
        <CounterBar game={game} p={p} h={geo.barH} lw={geo.lw} manaMode={mana.mounted} onFlash={flash.show} />
      </Rotated>
    </div>
  );
}

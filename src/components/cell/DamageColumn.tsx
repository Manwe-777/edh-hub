import { LETHAL_CMD_DAMAGE } from '../../constants';
import type { Player } from '../../game/Player';
import { mutate } from '../../store/mutate';
import type { SwipeDir } from '../../types';
import { cx } from '../../utils/cx';
import { StepPress } from './StepPress';

interface Props {
  source: Player;
  target: Player;
  cmd: 0 | 1;
  rotation: number;
  swipe: (d: SwipeDir) => void;
  font: number;
}

/** − damage + for one partner commander, with its name below. */
export function DamageColumn({ source, target, cmd, rotation, swipe, font }: Props) {
  const dmg = target.cmdDamage[source.id][cmd];
  const change = (n: number) => mutate((g) => g.addCmdDamage(target.id, source.id, cmd, n));
  return (
    <div className={`dmg-col from-${cmd === 0 ? 'left' : 'right'}`}>
      <div className="dmg-row">
        <StepPress className="sq-btn" sign={-1} onStep={change} rotation={rotation} swipe={swipe} label="Remove damage">
          −
        </StepPress>
        <div
          className={cx('dmg-num', dmg >= LETHAL_CMD_DAMAGE && 'lethal')}
          style={{ fontSize: Math.min(font * 0.55, 56) }}
        >
          {dmg}
        </div>
        <StepPress className="sq-btn" sign={1} onStep={change} rotation={rotation} swipe={swipe} label="Add damage">
          +
        </StepPress>
      </div>
      <div className="dmg-name">{source.commanders[cmd].name || `Commander ${cmd + 1}`}</div>
    </div>
  );
}

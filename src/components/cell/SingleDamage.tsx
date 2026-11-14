import { LETHAL_CMD_DAMAGE } from '../../constants';
import { addCmdDamage } from '../../game/addCmdDamage';
import { mutate } from '../../store/mutate';
import { cx } from '../../utils/cx';
import type { DamageProps } from './DamageControls';
import { StepPress } from './StepPress';

/** Damage from a single commander, with remove/add halves like the life total. */
export function SingleDamage({ source, target, rotation, swipe, font, pad }: DamageProps) {
  const dmg = target.cmdDamage[source.id][0];
  const change = (n: number) => mutate((g) => addCmdDamage(g, target.id, source.id, 0, n));
  return (
    <>
      <StepPress
        className="half left"
        sign={-1}
        onStep={change}
        rotation={rotation}
        swipe={swipe}
        label="Remove damage"
      >
        <span className="pm from-left">−</span>
      </StepPress>
      <StepPress className="half right" sign={1} onStep={change} rotation={rotation} swipe={swipe} label="Add damage">
        <span className="pm from-right">+</span>
      </StepPress>
      <div className="life-wrap" style={{ top: pad.top, bottom: pad.bottom }}>
        <div className={cx('life dmg pop-in', dmg >= LETHAL_CMD_DAMAGE && 'lethal')} style={{ fontSize: font }}>
          {dmg}
        </div>
      </div>
    </>
  );
}

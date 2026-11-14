import { Press } from '../common/Press';
import { DamageColumn } from './DamageColumn';
import type { DamageProps } from './DamageControls';

/** Damage from each of two partner commanders, side by side. */
export function PartnerDamage({ source, target, rotation, swipe, font, pad }: DamageProps) {
  return (
    <Press
      className="dmg-two"
      rotation={rotation}
      onSwipe={swipe}
      style={{ paddingTop: pad.top, paddingBottom: pad.bottom }}
    >
      <div className="dmg-cols">
        {([0, 1] as const).map((c) => (
          <DamageColumn key={c} source={source} target={target} cmd={c} rotation={rotation} swipe={swipe} font={font} />
        ))}
      </div>
    </Press>
  );
}

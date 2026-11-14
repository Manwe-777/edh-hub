import type { Pad, Player, SwipeDir } from '../../types';
import { PartnerDamage } from './PartnerDamage';
import { SingleDamage } from './SingleDamage';

export interface DamageProps {
  source: Player;
  target: Player;
  rotation: number;
  swipe: (d: SwipeDir) => void;
  font: number;
  pad: Pad;
}

/** In a commander-damage view: what this cell's commanders dealt to the target. */
export function DamageControls(props: DamageProps) {
  return props.source.commanderCount === 1 ? <SingleDamage {...props} /> : <PartnerDamage {...props} />;
}

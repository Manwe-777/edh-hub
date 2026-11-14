import type { CSSProperties, ReactNode } from 'react';

import { HOLD_STEP } from '../../constants';
import type { SwipeDir } from '../../types';
import { Press } from '../common/Press';

interface Props {
  className: string;
  /** Called with ±1 on tap and ±HOLD_STEP while held. */
  onStep: (n: number) => void;
  sign: 1 | -1;
  label: string;
  rotation?: number;
  swipe?: (d: SwipeDir) => void;
  style?: CSSProperties;
  children: ReactNode;
}

/** A +/− control: tap for one, hold to repeat by HOLD_STEP. */
export function StepPress({ className, onStep, sign, label, rotation, swipe, style, children }: Props) {
  return (
    <Press
      className={className}
      style={style}
      rotation={rotation}
      onTap={() => onStep(sign)}
      onHold={() => onStep(sign * HOLD_STEP)}
      onSwipe={swipe}
      label={label}
    >
      {children}
    </Press>
  );
}

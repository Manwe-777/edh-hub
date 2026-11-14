import type { Ref } from 'react';

import { addLife } from '../../game/addLife';
import { mutate } from '../../store/mutate';
import type { Pad, Player, SwipeDir } from '../../types';
import { LifeTotal } from './LifeTotal';
import { StepPress } from './StepPress';

interface Props {
  p: Player;
  rotation: number;
  swipe: (d: SwipeDir) => void;
  font: number;
  defeat: string | null;
  delta: number;
  caption: string | null;
  pad: Pad;
  wrapRef: Ref<HTMLDivElement>;
}

/** Life total with lose/gain halves; a defeat line replaces the total once the player has lost. */
export function LifeArea({ p, rotation, swipe, font, defeat, delta, caption, pad, wrapRef }: Props) {
  const change = (n: number) => mutate((g) => addLife(g, p.id, n));
  return (
    <>
      <StepPress className="half left" sign={-1} onStep={change} rotation={rotation} swipe={swipe} label="Lose life">
        <span className="pm">−</span>
      </StepPress>
      <StepPress className="half right" sign={1} onStep={change} rotation={rotation} swipe={swipe} label="Gain life">
        <span className="pm">+</span>
      </StepPress>
      <div ref={wrapRef} className="life-wrap" style={{ top: pad.top, bottom: pad.bottom }}>
        {caption && <div className="caption">{caption}</div>}
        {defeat ? (
          <div key={defeat} className="defeat" style={{ fontSize: Math.max(20, font * 0.34) }}>
            {defeat}
          </div>
        ) : (
          <LifeTotal life={p.life} delta={delta} font={font} />
        )}
      </div>
    </>
  );
}

import { useState } from 'react';

import { rollDie } from '../../utils/rollDie';
import { Segmented } from '../common/Segmented';
import { MenuSection } from './MenuSection';

const ROLLS = {
  Coin: () => (rollDie(2) === 1 ? 'Heads' : 'Tails'),
  d6: () => `d6 · ${rollDie(6)}`,
  d20: () => `d20 · ${rollDie(20)}`,
};
type RollKind = keyof typeof ROLLS;
const KINDS = Object.keys(ROLLS) as RollKind[];

/** Coin flip and dice, with the result in the heading. `n` replays the pop animation on every roll. */
export function QuickRoll() {
  const [result, setResult] = useState<{ text: string; n: number } | null>(null);
  const roll = (k: RollKind) => setResult((r) => ({ text: ROLLS[k](), n: (r?.n ?? 0) + 1 }));
  return (
    <MenuSection
      icon="dice"
      title="Quick roll"
      aside={
        result && (
          <span className="quick-result" key={result.n}>
            {result.text}
          </span>
        )
      }
    >
      <Segmented options={KINDS} onSelect={roll} plain />
    </MenuSection>
  );
}

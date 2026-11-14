import type { CSSProperties } from 'react';

import type { Game } from '../../game/Game';
import type { Player } from '../../game/Player';
import { mutate } from '../../store/mutate';
import type { TokenCounter } from '../../types';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';
import { CounterIcon } from '../icons/CounterIcon';

interface Props {
  game: Game;
  p: Player;
  k: TokenCounter;
  style: CSSProperties;
}

/** Monarch / initiative: tap to take it, hold to give it up. */
export function TokenButton({ game, p, k, style }: Props) {
  return (
    <Press
      className={cx('ctr', game[k] === p.id && 'on')}
      style={style}
      label={k}
      onTap={() => mutate((g) => g.claimToken(k, p.id))}
      onHold={() => mutate((g) => g.dropToken(k, p.id))}
      repeat={false}
    >
      <CounterIcon k={k} />
    </Press>
  );
}

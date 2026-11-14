import type { CSSProperties } from 'react';

import { claimToken } from '../../game/claimToken';
import { dropToken } from '../../game/dropToken';
import { mutate } from '../../store/mutate';
import type { Game, Player, TokenCounter } from '../../types';
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
      onTap={() => mutate((g) => claimToken(g, k, p.id))}
      onHold={() => mutate((g) => dropToken(g, k, p.id))}
      repeat={false}
    >
      <CounterIcon k={k} />
    </Press>
  );
}

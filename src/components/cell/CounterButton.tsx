import type { BarItem, Game, NumericCounter, Player } from '../../types';
import { ManaPoolButton } from './ManaPoolButton';
import { NumericCounterButton } from './NumericCounterButton';
import { TokenButton } from './TokenButton';

interface Props {
  game: Game;
  p: Player;
  k: BarItem;
  size: number;
  onFlash: (k: NumericCounter) => void;
}

export function CounterButton({ game, p, k, size, onFlash }: Props) {
  const style = { width: size, height: size, fontSize: size * 0.56 };
  if (k === 'mana') return <ManaPoolButton p={p} style={style} />;
  if (k === 'monarch' || k === 'initiative') return <TokenButton game={game} p={p} k={k} style={style} />;
  return <NumericCounterButton p={p} k={k} style={style} onFlash={onFlash} />;
}

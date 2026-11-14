import { counterBarItems } from '../../game/counterBarItems';
import type { Game, NumericCounter, Player } from '../../types';
import { cx } from '../../utils/cx';
import { CounterButton } from './CounterButton';

interface Props {
  game: Game;
  p: Player;
  /** Bar height; 0 hides the bar. */
  h: number;
  lw: number;
  /** The mana pool is open: only mana and storm stay usable. */
  manaMode: boolean;
  onFlash: (k: NumericCounter) => void;
}

export function CounterBar({ game, p, h, lw, manaMode, onFlash }: Props) {
  if (h <= 0) return null;
  const items = counterBarItems(p);
  const size = Math.min(h - 4, lw / items.length - 6);
  return (
    <div className={cx('bar', manaMode && 'mana-mode')} style={{ height: h }}>
      {items.map((k) => (
        <CounterButton key={k} game={game} p={p} k={k} size={size} onFlash={onFlash} />
      ))}
    </div>
  );
}

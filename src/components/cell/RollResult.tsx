import type { Player } from '../../game/Player';
import { useSpin } from '../../hooks/useSpin';
import { mutate } from '../../store/mutate';
import type { Roll } from '../../types';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';

/** This player's d20 spinning to their roll; the winner's pulses over a rainbow. Tap to dismiss. */
export function RollResult({ roll, p, font }: { roll: Roll; p: Player; font: number }) {
  const mine = roll.rounds.map((r) => r[p.id]).filter((v): v is number => v !== null);
  const { value, done } = useSpin(mine[mine.length - 1]);
  const won = done && roll.winner === p.id;
  return (
    <Press
      className={cx('roll', done && 'settled', won && 'win')}
      onTap={() => mutate((g) => void (g.roll = null), false)}
      label="Dismiss roll"
    >
      {won && <div className="winner-fx" />}
      <div className={cx('roll-val', done && 'pop-in')} style={{ fontSize: font * 0.8 }}>
        {value}
      </div>
      <div className="roll-hist">{done && mine.length > 1 ? `tie-break: ${mine.join(' → ')}` : ' '}</div>
    </Press>
  );
}

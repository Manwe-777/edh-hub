import { PLAYER_COUNTS } from '../../constants';
import { mutate } from '../../store/mutate';
import { Segmented } from '../common/Segmented';

/** Changing the player count leaves a damage view for a seat that's gone and clears any roll. */
export function PlayerCountPicker({ count }: { count: number }) {
  return (
    <Segmented
      options={PLAYER_COUNTS}
      selected={count}
      onSelect={(n) =>
        mutate((g) => {
          g.playerCount = n;
          if (g.view.kind === 'cmd' && g.view.target >= n) g.view = { kind: 'normal' };
          g.roll = null;
        })
      }
    />
  );
}

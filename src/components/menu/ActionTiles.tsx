import { resetGame } from '../../game/resetGame';
import { resetPlayers } from '../../game/resetPlayers';
import { rollHigh } from '../../game/rollHigh';
import { mutate } from '../../store/mutate';
import { undo } from '../../store/undo';
import { useStore } from '../../store/useStore';
import { UiIcon } from '../icons/UiIcon';
import { Tile } from './Tile';

/** Roll high, undo and the two resets; all but undo close the menu. */
export function ActionTiles({ onDone }: { onDone: () => void }) {
  const { undo: undoStack } = useStore();

  const andClose = (fn: () => void) => () => {
    fn();
    onDone();
  };

  return (
    <div className="mt-1 grid grid-cols-2 gap-2">
      <Tile
        icon={<i className="ms ms-ability-d20" />}
        label="Roll high"
        onClick={andClose(() => mutate((g) => rollHigh(g), false))}
      />
      <Tile icon={<UiIcon name="undo" size={26} />} label="Undo" disabled={!undoStack.length} onClick={undo} />
      <Tile
        icon={<UiIcon name="reset" size={26} />}
        label="Reset all"
        danger
        onClick={andClose(() => mutate((g) => resetGame(g)))}
      />
      <Tile
        icon={<UiIcon name="users" size={26} />}
        label="Reset players"
        danger
        onClick={andClose(() => mutate((g) => resetPlayers(g)))}
      />
    </div>
  );
}

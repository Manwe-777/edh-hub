import { resetGame } from '../../game/resetGame';
import { resetPlayers } from '../../game/resetPlayers';
import { rollHigh } from '../../game/rollHigh';
import { mutate } from '../../store/mutate';
import { undo } from '../../store/undo';
import { useStore } from '../../store/useStore';
import { UiIcon } from '../icons/UiIcon';

/** Roll high, undo and the two resets; all but undo close the menu. */
export function ActionTiles({ onDone }: { onDone: () => void }) {
  const { undo: undoStack } = useStore();

  const andClose = (fn: () => void) => () => {
    fn();
    onDone();
  };

  return (
    <div className="tiles">
      <button className="tile" onClick={andClose(() => mutate((g) => rollHigh(g), false))}>
        <i className="ms ms-ability-d20" />
        <span>Roll high</span>
      </button>
      <button className="tile" disabled={!undoStack.length} onClick={() => undo()}>
        <UiIcon name="undo" size={26} />
        <span>Undo</span>
      </button>
      <button className="tile danger" onClick={andClose(() => mutate((g) => resetGame(g)))}>
        <UiIcon name="reset" size={26} />
        <span>Reset all</span>
      </button>
      <button className="tile danger" onClick={andClose(() => mutate((g) => resetPlayers(g)))}>
        <UiIcon name="users" size={26} />
        <span>Reset players</span>
      </button>
    </div>
  );
}

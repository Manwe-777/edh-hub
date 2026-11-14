import type { Game } from '../../game/Game';
import { mutate } from '../../store/mutate';
import { LIST_GROUP, LIST_ROW } from '../common/styles';
import { UiIcon } from '../icons/UiIcon';
import { SwitchRow } from './SwitchRow';

const toggleFullscreen = () =>
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();

export function SettingsList({ game }: { game: Game }) {
  return (
    <section className={LIST_GROUP}>
      <SwitchRow
        icon={<UiIcon name="sun" size={20} />}
        label="Keep screen awake"
        on={game.keepAwake}
        onToggle={() => mutate((g) => void (g.keepAwake = !g.keepAwake), false)}
      />
      <SwitchRow
        icon={<i className="ms ms-commander w-5 text-center text-lg" />}
        label="Commander damage on cells"
        on={game.cmdTally}
        onToggle={() => mutate((g) => void (g.cmdTally = !g.cmdTally), false)}
      />
      <button className={LIST_ROW} onClick={toggleFullscreen}>
        <UiIcon name="expand" size={20} />
        <span className="flex-1">Fullscreen</span>
      </button>
    </section>
  );
}

import { mutate } from '../../store/mutate';
import type { Game } from '../../types';
import { UiIcon } from '../icons/UiIcon';
import { SwitchRow } from './SwitchRow';

const toggleFullscreen = () =>
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();

export function SettingsList({ game }: { game: Game }) {
  return (
    <section className="group list">
      <SwitchRow
        icon={<UiIcon name="sun" size={20} />}
        label="Keep screen awake"
        on={game.keepAwake}
        onToggle={() => mutate((g) => void (g.keepAwake = !g.keepAwake), false)}
      />
      <SwitchRow
        icon={<i className="ms ms-commander row-ms" />}
        label="Commander damage on cells"
        on={game.cmdTally}
        onToggle={() => mutate((g) => void (g.cmdTally = !g.cmdTally), false)}
      />
      <button className="row" onClick={toggleFullscreen}>
        <UiIcon name="expand" size={20} />
        <span>Fullscreen</span>
      </button>
    </section>
  );
}

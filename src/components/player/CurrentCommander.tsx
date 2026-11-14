import type { Commander } from '../../types';
import { UiIcon } from '../icons/UiIcon';
import { PinButton } from './PinButton';

interface Props {
  cmd: Commander;
  slot: 0 | 1;
  pins: string[];
  onClear: () => void;
}

/** The chosen commander's art, name and artist, with pin and clear buttons. */
export function CurrentCommander({ cmd, slot, pins, onClear }: Props) {
  return (
    <div className="cmdr-current">
      {cmd.art ? <img src={cmd.art} alt="" /> : <div className="cmdr-ph" />}
      <div>
        <div>{cmd.name || `Commander ${slot + 1}`}</div>
        <div className="muted">{cmd.artist ? `Art by ${cmd.artist}` : 'No art — uses player color'}</div>
      </div>
      {cmd.name && <PinButton name={cmd.name} pinned={pins.includes(cmd.name)} />}
      {cmd.name && (
        <button className="icon-btn small" aria-label="Clear" onClick={onClear}>
          <UiIcon name="close" size={18} />
        </button>
      )}
    </div>
  );
}

import type { Commander } from '../../types';
import { IconButton } from '../common/IconButton';
import { UiIcon } from '../icons/UiIcon';
import { PinButton } from './PinButton';

const THUMB = 'h-12 w-16 flex-none rounded-[10px] object-cover';

interface Props {
  cmd: Commander;
  slot: 0 | 1;
  pins: string[];
  onClear: () => void;
}

/** The chosen commander's art, name and artist, with pin and clear buttons. */
export function CurrentCommander({ cmd, slot, pins, onClear }: Props) {
  return (
    <div className="flex items-center gap-3">
      {cmd.art ? <img src={cmd.art} alt="" className={THUMB} /> : <div className={`${THUMB} bg-surface-2`} />}
      <div className="min-w-0 flex-1">
        <div>{cmd.name || `Commander ${slot + 1}`}</div>
        <div className="text-[13px] text-muted">
          {cmd.artist ? `Art by ${cmd.artist}` : 'No art — uses player color'}
        </div>
      </div>
      {cmd.name && <PinButton name={cmd.name} pinned={pins.includes(cmd.name)} />}
      {cmd.name && (
        <IconButton small aria-label="Clear" onClick={onClear}>
          <UiIcon name="close" size={18} />
        </IconButton>
      )}
    </div>
  );
}

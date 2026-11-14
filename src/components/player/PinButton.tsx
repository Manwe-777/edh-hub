import { togglePin } from '../../pins/togglePin';
import { cx } from '../../utils/cx';
import { UiIcon } from '../icons/UiIcon';

export function PinButton({ name, pinned }: { name: string; pinned: boolean }) {
  return (
    <button
      className={cx('icon-btn small pin', pinned && 'on')}
      aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
      aria-pressed={pinned}
      onClick={() => togglePin(name)}
    >
      <UiIcon name="star" size={18} filled={pinned} />
    </button>
  );
}

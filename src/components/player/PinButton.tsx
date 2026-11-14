import { togglePin } from '../../pins/togglePin';
import { IconButton } from '../common/IconButton';
import { UiIcon } from '../icons/UiIcon';

export function PinButton({ name, pinned }: { name: string; pinned: boolean }) {
  return (
    <IconButton
      small
      tone={pinned ? 'text-accent' : undefined}
      aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
      aria-pressed={pinned}
      onClick={() => togglePin(name)}
    >
      <UiIcon name="star" size={18} filled={pinned} />
    </IconButton>
  );
}

import { PinButton } from './PinButton';

interface Props {
  names: string[];
  pins: string[];
  onPick: (name: string) => void;
}

export function NameList({ names, pins, onPick }: Props) {
  return (
    <ul className="overflow-hidden rounded-xl bg-surface-2">
      {names.map((n) => (
        <li key={n} className="flex items-center pr-1.5 not-first:shadow-[0_-1px_0_var(--color-surface)]">
          <button
            className="block min-w-0 flex-1 px-3.5 py-[13px] text-left text-text active:bg-surface"
            onClick={() => onPick(n)}
          >
            {n}
          </button>
          <PinButton name={n} pinned={pins.includes(n)} />
        </li>
      ))}
    </ul>
  );
}

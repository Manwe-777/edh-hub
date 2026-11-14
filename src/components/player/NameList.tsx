import { PinButton } from './PinButton';

interface Props {
  names: string[];
  pins: string[];
  onPick: (name: string) => void;
}

export function NameList({ names, pins, onPick }: Props) {
  return (
    <ul className="suggest">
      {names.map((n) => (
        <li key={n}>
          <button className="suggest-name" onClick={() => onPick(n)}>
            {n}
          </button>
          <PinButton name={n} pinned={pins.includes(n)} />
        </li>
      ))}
    </ul>
  );
}

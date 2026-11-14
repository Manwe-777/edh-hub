import { mutate } from '../store/mutate';

interface Props {
  x: number;
  y: number;
  /** A damage view or roll is showing: the button closes it instead of opening the menu. */
  back: boolean;
  onMenu: () => void;
}

const closeOverlay = () =>
  mutate((g) => {
    g.view = { kind: 'normal' };
    g.roll = null;
  }, false);

/** The round button in the middle of the table. */
export function HubButton({ x, y, back, onMenu }: Props) {
  return (
    <button
      className={back ? 'hub back' : 'hub'}
      style={{ left: x, top: y }}
      aria-label={back ? 'Back' : 'Menu'}
      onClick={back ? closeOverlay : onMenu}
    >
      {back ? '✕' : <span className="hub-icon" />}
    </button>
  );
}

import { PALETTE } from '../../constants';
import { cx } from '../../utils/cx';

export function ColorSwatches({ selected, onPick }: { selected: string; onPick: (c: string) => void }) {
  return (
    <div className="swatches">
      {PALETTE.map((c) => (
        <button
          key={c}
          className={cx('swatch', selected === c && 'on')}
          style={{ background: c }}
          aria-label={c}
          aria-pressed={selected === c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}

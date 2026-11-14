import { PALETTE } from '../../constants';
import { cx } from '../../utils/cx';

export function ColorSwatches({ selected, onPick }: { selected: string; onPick: (c: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {PALETTE.map((c) => (
        <button
          key={c}
          className={cx(
            'relative aspect-square w-full max-w-[52px] justify-self-center rounded-full',
            selected === c &&
              "after:absolute after:-inset-1 after:rounded-full after:border-2 after:border-text after:content-['']",
          )}
          style={{ background: c }}
          aria-label={c}
          aria-pressed={selected === c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}

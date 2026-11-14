import { LETHAL_CMD_DAMAGE, TALLY_GAP, TALLY_INNER, TALLY_PAD, TALLY_TOP } from '../../constants';
import type { SwipeDir, TallyLayout, TallySquare } from '../../types';
import { cx } from '../../utils/cx';
import { Press } from '../common/Press';

interface Props {
  groups: TallySquare[][];
  /** No layout: nothing to show. */
  layout: TallyLayout | null;
  bottom: number;
  rotation: number;
  onTap: () => void;
  swipe: (d: SwipeDir) => void;
}

/** Commander damage taken, as art (or color) squares on the cell's right edge; one tile per opponent. */
export function Tally({ groups, layout, bottom, rotation, onTap, swipe }: Props) {
  if (!layout) return null;
  return (
    <Press
      className="tally"
      rotation={rotation}
      onTap={onTap}
      onSwipe={swipe}
      label="Commander damage taken"
      style={{
        top: TALLY_TOP,
        bottom,
        width: layout.width,
        gridTemplateColumns: `repeat(${layout.cols}, ${layout.tileW}px)`,
        gridAutoRows: layout.size,
        gap: TALLY_GAP,
        padding: `0 ${TALLY_PAD}px`,
      }}
    >
      {groups.map((g) => (
        <div key={g[0].key} className="tally-tile" style={{ gap: TALLY_INNER }}>
          {g.map((t) => (
            <div
              key={t.key}
              className={cx('tally-sq', t.dmg >= LETHAL_CMD_DAMAGE && 'lethal')}
              style={{
                width: layout.size,
                background: t.art ? `center 30% / cover url("${t.art}")` : t.color,
                fontSize: Math.max(10, layout.size * 0.44),
              }}
            >
              <span>{t.dmg}</span>
            </div>
          ))}
        </div>
      ))}
    </Press>
  );
}

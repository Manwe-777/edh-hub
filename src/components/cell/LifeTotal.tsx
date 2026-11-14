import { formatDelta } from '../../utils/formatDelta';

/** The life number, with the running change beside it. */
export function LifeTotal({ life, delta, font }: { life: number; delta: number; font: number }) {
  return (
    <div className="life" style={{ fontSize: font }}>
      {life}
      {delta !== 0 && (
        <span className="delta" style={{ fontSize: Math.max(18, font * 0.34) }}>
          {formatDelta(delta)}
        </span>
      )}
    </div>
  );
}

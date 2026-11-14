import type { ArtOption } from '../../types';

export function ArtGrid({ arts, onPick }: { arts: ArtOption[]; onPick: (a: ArtOption) => void }) {
  return (
    <div className="arts">
      {arts.map((a) => (
        <button key={a.key} className="art-opt" onClick={() => onPick(a)}>
          <img src={a.art} alt={a.label} loading="lazy" />
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

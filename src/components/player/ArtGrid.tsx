import type { ArtOption } from '../../types';

export function ArtGrid({ arts, onPick }: { arts: ArtOption[]; onPick: (a: ArtOption) => void }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
      {arts.map((a) => (
        <button key={a.key} className="flex flex-col gap-1 text-left text-[11px] text-muted" onClick={() => onPick(a)}>
          <img src={a.art} alt={a.label} loading="lazy" className="aspect-[4/3] w-full rounded-[10px] object-cover" />
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The player's color, or their commanders' art side by side (partners split the cell). */
export function CellBackground({ arts }: { arts: string[] }) {
  const share = 100 / arts.length;
  return (
    <div className="cell-bg">
      {arts.map((a, i) => (
        <div
          key={i}
          className="bg-art"
          style={{ backgroundImage: `url("${a}")`, width: `${share}%`, left: `${share * i}%` }}
        />
      ))}
    </div>
  );
}

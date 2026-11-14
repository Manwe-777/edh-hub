import type { Game, Player, TallySquare } from '../types';

/** Per other active player, one square per commander that has dealt damage to `p`; players with none are left out. */
export function tallySources(game: Game, p: Player): TallySquare[][] {
  const out: TallySquare[][] = [];

  for (let i = 0; i < game.playerCount; i++) {
    if (i === p.id) continue;
    const s = game.players[i];

    const squares = Array.from({ length: s.commanderCount }, (_, c) => ({
      key: `${i}-${c}`,
      color: s.color,
      art: s.commanders[c].art,
      dmg: p.cmdDamage[i][c],
    })).filter((t) => t.dmg > 0);

    if (squares.length) out.push(squares);
  }

  return out;
}

import { MAX_VISIBLE_COUNTERS } from '../../constants';
import type { Game } from '../../game/Game';
import { mutate } from '../../store/mutate';
import { toggleCounter } from '../../utils/toggleCounter';
import { CounterChips } from '../common/CounterChips';
import { Screen } from '../common/Screen';
import { Segmented } from '../common/Segmented';
import { MenuSection } from '../menu/MenuSection';
import { ColorSwatches } from './ColorSwatches';
import { CommanderPicker } from './CommanderPicker';
import { NameInput } from './NameInput';

interface Props {
  game: Game;
  id: number;
  leaving: boolean;
  onClose: () => void;
}

const set = (fn: (g: Game) => void) => mutate(fn, false);

/** Full-screen options panel, always upright so the on-screen keyboard matches it. */
export function PlayerOptions({ game, id, leaving, onClose }: Props) {
  const p = game.players[id];
  return (
    <Screen
      leaving={leaving}
      onClose={onClose}
      head={
        <>
          <span className="size-3.5 flex-none rounded-full" style={{ background: p.color }} />
          <NameInput name={p.name} onChange={(name) => set((g) => void (g.players[id].name = name))} />
        </>
      }
    >
      <MenuSection icon="palette" title="Color">
        <ColorSwatches selected={p.color} onPick={(c) => set((g) => void (g.players[id].color = c))} />
      </MenuSection>

      <MenuSection icon="user" title="Commanders">
        <Segmented
          options={[1, 2] as const}
          selected={p.commanderCount}
          label={(n) => (n === 1 ? 'One' : 'Two (partners)')}
          onSelect={(n) => set((g) => void (g.players[id].commanderCount = n))}
        />
        {Array.from({ length: p.commanderCount }, (_, c) => (
          <CommanderPicker key={c} game={game} id={id} slot={c as 0 | 1} />
        ))}
      </MenuSection>

      <MenuSection title="Counters" note={`up to ${MAX_VISIBLE_COUNTERS}`}>
        <CounterChips
          selected={p.visibleCounters}
          onToggle={(k) => set((g) => toggleCounter(g.players[id].visibleCounters, k))}
        />
      </MenuSection>
    </Screen>
  );
}

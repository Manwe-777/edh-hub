import { MAX_VISIBLE_COUNTERS } from '../../constants';
import { toggleCounter } from '../../game/toggleCounter';
import { mutate } from '../../store/mutate';
import type { Game } from '../../types';
import { CounterChips } from '../common/CounterChips';
import { Screen } from '../common/Screen';
import { LIST_GROUP } from '../common/styles';
import { AboutRow } from './AboutRow';
import { ActionTiles } from './ActionTiles';
import { MenuSection } from './MenuSection';
import { PlayerCountPicker } from './PlayerCountPicker';
import { QuickRoll } from './QuickRoll';
import { SettingsList } from './SettingsList';
import { StartingLifePicker } from './StartingLifePicker';

interface Props {
  game: Game;
  leaving: boolean;
  onClose: () => void;
}

/** The game menu: actions, table setup, quick dice and settings. */
export function CenterMenu({ game, leaving, onClose }: Props) {
  return (
    <Screen leaving={leaving} onClose={onClose} head={<h2 className="flex-1 text-[22px] font-medium">Game</h2>}>
      <ActionTiles onDone={onClose} />
      <MenuSection icon="users" title="Players">
        <PlayerCountPicker count={game.playerCount} />
      </MenuSection>
      <MenuSection icon="heart" title="Starting life" note="applies on reset">
        <StartingLifePicker life={game.startingLife} />
      </MenuSection>
      <MenuSection title="Default counters" note={`up to ${MAX_VISIBLE_COUNTERS}, given to everyone on Reset players`}>
        <CounterChips
          selected={game.defaultCounters}
          onToggle={(k) => mutate((g) => toggleCounter(g.defaultCounters, k), false)}
        />
      </MenuSection>
      <QuickRoll />
      <SettingsList game={game} />
      <section className={LIST_GROUP}>
        <AboutRow />
      </section>
    </Screen>
  );
}

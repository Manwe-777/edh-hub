import { useState } from 'react';
import { type Game, resetGame, resetPlayers, rollDie, rollHigh } from '../game';
import { mutate, undo, useStore } from '../store';
import { UiIcon } from './icons';

const LIFE_PRESETS = [20, 30, 40];
const PLAYER_COUNTS = [2, 3, 4, 5, 6];

export function CenterMenu({ game, leaving, onClose }: { game: Game; leaving: boolean; onClose: () => void }) {
  const { undo: undoStack } = useStore();
  const [custom, setCustom] = useState('');
  const [result, setResult] = useState<{ text: string; n: number } | null>(null);
  const isCustom = !LIFE_PRESETS.includes(game.startingLife);

  const andClose = (fn: () => void) => () => {
    fn();
    onClose();
  };
  const quick = (text: string) => setResult((r) => ({ text, n: (r?.n ?? 0) + 1 }));

  return (
    <div className={`screen${leaving ? ' leaving' : ''}`}>
      <div className="screen-body">
        <header className="screen-head">
          <h2>Game</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <UiIcon name="close" />
          </button>
        </header>

        <div className="tiles">
          <button className="tile" onClick={andClose(() => mutate((g) => rollHigh(g), false))}>
            <i className="ms ms-ability-d20" />
            <span>Roll high</span>
          </button>
          <button className="tile" disabled={!undoStack.length} onClick={() => undo()}>
            <UiIcon name="undo" size={26} />
            <span>Undo</span>
          </button>
          <button className="tile danger" onClick={andClose(() => mutate((g) => resetGame(g)))}>
            <UiIcon name="reset" size={26} />
            <span>Reset all</span>
          </button>
          <button className="tile danger" onClick={andClose(() => mutate((g) => resetPlayers(g)))}>
            <UiIcon name="users" size={26} />
            <span>Reset players</span>
          </button>
        </div>

        <section className="group">
          <h3><UiIcon name="users" size={18} /> Players</h3>
          <div className="segmented" style={{ ['--n' as string]: PLAYER_COUNTS.length }}>
            {PLAYER_COUNTS.map((n) => (
              <button
                key={n}
                className={game.playerCount === n ? 'on' : ''}
                onClick={() => mutate((g) => {
                  g.playerCount = n;
                  if (g.view.kind === 'cmd' && g.view.target >= n) g.view = { kind: 'normal' };
                  g.roll = null;
                })}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <section className="group">
          <h3><UiIcon name="heart" size={18} /> Starting life <small>applies on reset</small></h3>
          <div className="segmented" style={{ ['--n' as string]: LIFE_PRESETS.length + 1 }}>
            {LIFE_PRESETS.map((n) => (
              <button key={n} className={game.startingLife === n ? 'on' : ''} onClick={() => mutate((g) => void (g.startingLife = n), false)}>
                {n}
              </button>
            ))}
            <input
              className={isCustom && !custom ? 'on' : ''}
              inputMode="numeric"
              placeholder={isCustom ? String(game.startingLife) : 'Other'}
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={() => {
                const n = parseInt(custom, 10);
                if (n > 0) mutate((g) => void (g.startingLife = n), false);
                setCustom('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </div>
        </section>

        <section className="group">
          <h3>
            <UiIcon name="dice" size={18} /> Quick roll
            {result && <span className="quick-result" key={result.n}>{result.text}</span>}
          </h3>
          <div className="segmented plain" style={{ ['--n' as string]: 3 }}>
            <button onClick={() => quick(rollDie(2) === 1 ? 'Heads' : 'Tails')}>Coin</button>
            <button onClick={() => quick(`d6 · ${rollDie(6)}`)}>d6</button>
            <button onClick={() => quick(`d20 · ${rollDie(20)}`)}>d20</button>
          </div>
        </section>

        <section className="group list">
          <button className="row" onClick={() => mutate((g) => void (g.keepAwake = !g.keepAwake), false)}>
            <UiIcon name="sun" size={20} />
            <span>Keep screen awake</span>
            <span className={`switch${game.keepAwake ? ' on' : ''}`} />
          </button>
          <button className="row" onClick={() => mutate((g) => void (g.cmdTally = !g.cmdTally), false)}>
            <i className="ms ms-commander row-ms" />
            <span>Commander damage on cells</span>
            <span className={`switch${game.cmdTally ? ' on' : ''}`} />
          </button>
          <button
            className="row"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}
          >
            <UiIcon name="expand" size={20} />
            <span>Fullscreen</span>
          </button>
        </section>

        <section className="group list">
          <a className="row" href="https://github.com/Manwe-777/edh-hub" target="_blank" rel="noreferrer">
            <UiIcon name="github" size={20} />
            <span>EDH Hub on GitHub</span>
            <span className="row-meta">{/^\d/.test(__APP_VERSION__) ? `v${__APP_VERSION__}` : __APP_VERSION__}</span>
          </a>
        </section>
      </div>
    </div>
  );
}

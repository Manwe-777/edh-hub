import { useState } from 'react';
import { type Game, resetGame, rollDie, rollHigh } from '../game';
import { mutate, undo, useStore } from '../store';

const LIFE_PRESETS = [20, 30, 40];

export function CenterMenu({ game, leaving, onClose }: { game: Game; leaving: boolean; onClose: () => void }) {
  const { undo: undoStack } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [custom, setCustom] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const close = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <div className={`modal-backdrop${leaving ? ' leaving' : ''}`} onClick={onClose}>
      <div className="menu" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Menu</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div className="menu-grid">
          <button className="btn big" onClick={close(() => mutate((g) => rollHigh(g), false))}>
            <i className="ms ms-ability-d20" /> Roll high
          </button>
          <button className="btn big" disabled={!undoStack.length} onClick={() => undo()}>
            ↶ Undo
          </button>
        </div>

        <div className="field">
          <span>Reset game</span>
          {confirmReset ? (
            <div className="seg">
              <button className="btn danger" onClick={close(() => mutate((g) => resetGame(g)))}>
                Reset to {game.startingLife}
              </button>
              <button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn" onClick={() => setConfirmReset(true)}>Reset all life, damage and counters…</button>
          )}
        </div>

        <div className="field">
          <span>Starting life (applies on reset)</span>
          <div className="seg">
            {LIFE_PRESETS.map((n) => (
              <button key={n} className={`btn${game.startingLife === n ? ' on' : ''}`} onClick={() => mutate((g) => void (g.startingLife = n), false)}>
                {n}
              </button>
            ))}
            <input
              className="num"
              inputMode="numeric"
              placeholder="Custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
              onBlur={() => {
                const n = parseInt(custom, 10);
                if (n > 0 && n < 1000) mutate((g) => void (g.startingLife = n), false);
                setCustom('');
              }}
            />
          </div>
        </div>

        <div className="field">
          <span>Players</span>
          <div className="seg">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={`btn${game.playerCount === n ? ' on' : ''}`}
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
        </div>

        <div className="field">
          <span>Quick roll</span>
          <div className="seg">
            <button className="btn" onClick={() => setResult(`Coin: ${rollDie(2) === 1 ? 'Heads' : 'Tails'}`)}>Coin</button>
            <button className="btn" onClick={() => setResult(`d6: ${rollDie(6)}`)}>d6</button>
            <button className="btn" onClick={() => setResult(`d20: ${rollDie(20)}`)}>d20</button>
            {result && <span className="result" key={result + Math.random()}>{result}</span>}
          </div>
        </div>

        <div className="field">
          <span>Screen</span>
          <div className="seg">
            <button className={`btn${game.keepAwake ? ' on' : ''}`} onClick={() => mutate((g) => void (g.keepAwake = !g.keepAwake), false)}>
              Keep awake: {game.keepAwake ? 'on' : 'off'}
            </button>
            <button
              className="btn"
              onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}
            >
              Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

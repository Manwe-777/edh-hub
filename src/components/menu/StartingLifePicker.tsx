import { useState } from 'react';

import { LIFE_PRESETS } from '../../constants';
import { mutate } from '../../store/mutate';
import { cx } from '../../utils/cx';
import { Segmented } from '../common/Segmented';

const setLife = (n: number) => mutate((g) => void (g.startingLife = n), false);

/** 20 / 30 / 40, or any other value typed into the last cell. */
export function StartingLifePicker({ life }: { life: number }) {
  const [custom, setCustom] = useState('');
  const isCustom = !LIFE_PRESETS.includes(life);
  return (
    <Segmented
      options={LIFE_PRESETS}
      selected={life}
      onSelect={setLife}
      extra={
        <input
          className={cx(isCustom && !custom && 'on')}
          inputMode="numeric"
          placeholder={isCustom ? String(life) : 'Other'}
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 3))}
          onBlur={() => {
            const n = parseInt(custom, 10);
            if (n > 0) setLife(n);
            setCustom('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      }
    />
  );
}

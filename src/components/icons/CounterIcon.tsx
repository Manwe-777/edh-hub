import { COUNTER_MS_CLASS } from '../../constants';
import type { CounterKey } from '../../types';
import { CrownIcon } from './CrownIcon';
import { ExperienceIcon } from './ExperienceIcon';

export function CounterIcon({ k }: { k: CounterKey }) {
  if (k === 'monarch') return <CrownIcon />;
  if (k === 'experience') return <ExperienceIcon />;
  return <i className={`ms ${COUNTER_MS_CLASS[k]}`} aria-hidden />;
}

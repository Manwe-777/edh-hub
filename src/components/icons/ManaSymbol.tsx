import type { ManaColor } from '../../types';

export function ManaSymbol({ c }: { c: ManaColor }) {
  return <i className={`ms ms-${c.toLowerCase()} ms-cost ms-shadow`} aria-hidden />;
}

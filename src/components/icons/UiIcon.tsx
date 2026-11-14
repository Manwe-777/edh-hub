import { UI_ICON_PATHS, type UiIconName } from './uiIconPaths';

interface Props {
  name: UiIconName;
  size?: number;
  filled?: boolean;
}

export function UiIcon({ name, size = 22, filled = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {UI_ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

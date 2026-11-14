/** Class lists shared by several panel components. */

/** A cell of a segmented control (button or input). */
export const SEGMENT_CELL =
  'h-11 min-w-0 rounded-[10px] px-1 text-center text-base font-medium transition-colors active:bg-surface-2 active:transition-none';
export const SEGMENT_ON = 'bg-text text-bg placeholder:text-bg';
export const SEGMENT_OFF = 'text-text';

/** A full-width row in a rounded list group. */
export const LIST_ROW =
  'flex h-14 w-full items-center gap-3.5 px-4 text-left text-[15px] text-text no-underline not-first:shadow-[0_-1px_0_var(--color-surface-2)] active:bg-surface-2';
export const LIST_GROUP = 'mt-6 overflow-hidden rounded-2xl bg-surface';

/** Toggle chips (counters). */
export const CHIP = 'inline-flex h-10 items-center gap-2 rounded-[20px] px-3.5 text-sm transition-colors';
export const CHIP_ON = 'bg-text text-bg';
export const CHIP_OFF = 'bg-surface text-text';

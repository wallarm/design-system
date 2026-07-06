import type { ChartColor } from '../types';

/** Reserved key for the auto-generated remainder tail (must not collide with a datum name). */
export const REMAINDER_KEY = '__horizontal-bar-stack-remainder__';

/**
 * Auto-cycle order for data without an explicit `color`. Leads with the
 * warm hues used in the Figma reference (red → brand/w-orange → amber).
 */
export const HORIZONTAL_BAR_STACK_PALETTE: ChartColor[] = [
  'red',
  'brand',
  'amber',
  'blue',
  'green',
  'purple',
  'teal',
  'cyan',
  'indigo',
  'pink',
  'rose',
  'slate',
];

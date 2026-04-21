import type { BadgeColor } from '../../../../Badge';

/** The five valid HTTP status-code classes, used both for suggestion-building
 *  and validation. Backed by the standard HTTP spec — entirely frontend-driven,
 *  independent of what the backend config carries.
 *
 *  Typed as `readonly string[]` (not `as const`) so `.includes(someString)`
 *  stays callable without casting; declaration-file generation rejects the
 *  tuple-narrowed overload of `.includes`. */
export const MASK_ROOTS: readonly string[] = ['1', '2', '3', '4', '5'];

/** Badge color per HTTP class, keyed by the leading digit. Derived from the
 *  AS-877 Figma designs: informational greys, success greens, redirect blues,
 *  client-error ambers, server-error reds. */
export const HTTP_CLASS_BADGE_COLOR: Record<string, BadgeColor> = {
  '1': 'slate',
  '2': 'green',
  '3': 'blue',
  '4': 'amber',
  '5': 'red',
};

/** Fixed length of a status-code value (mask or concrete). Exposed as a
 *  constant so downstream helpers stay in sync. */
export const STATUS_CODE_LENGTH = 3;

/** Placeholder character used inside masks (e.g. the `X` in `4XX`). */
export const MASK_PLACEHOLDER = 'X';

// Zag `mergeProps`: `undefined` falls back to Ark's value, `null` wins and React omits the
// attribute. Ark renders Steps as tabs; the Stepper is a list of buttons with plain step bodies,
// so Ark's tab ARIA is removed here, in one place. `Stepper.a11y.test.tsx` pins this rule
// against Ark/Zag upgrades.
const REMOVE = null as unknown as undefined;

export const ARK_LIST_ARIA_RESET = {
  role: REMOVE,
  'aria-owns': REMOVE,
  'aria-orientation': REMOVE,
} as const;

export const ARK_ITEM_ARIA_RESET = { 'aria-current': REMOVE } as const;

export const ARK_TAB_ARIA_RESET = {
  role: REMOVE,
  'aria-selected': REMOVE,
  'aria-controls': REMOVE,
} as const;

// Content is a `group` named by its step trigger, not a `tabpanel`: `tabIndex: 0` is a tabs
// convention that would add a stray Tab stop before the step's first field.
export const ARK_CONTENT_ARIA_RESET = { tabIndex: REMOVE } as const;

/** The design supports up to six steps; more logs a dev warning. */
export const STEPPER_MAX_STEPS = 6;

export const DEFAULT_STEPPER_STATUS_LABELS = {
  completed: 'Completed',
  danger: 'Has errors',
} as const;

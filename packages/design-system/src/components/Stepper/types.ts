/** Status set by the page. `'active'` is never passed: it is derived from the current step. */
export type StepperItemStatus = 'upcoming' | 'completed' | 'danger';

/** Rendered state, exposed as `data-status`. */
export type StepperVisualStatus = 'active' | StepperItemStatus;

/** Screen-reader-only status suffixes (i18n). */
export interface StepperStatusLabels {
  /** Default `'Completed'`. */
  completed?: string;
  /** Default `'Has errors'`. */
  danger?: string;
}

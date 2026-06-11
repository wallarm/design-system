import type { ButtonHTMLAttributes } from 'react';
import type { Tour as ArkUiTour } from '@ark-ui/react';

export type TourStepDetails = ArkUiTour.StepDetails;

export type TourStepEffectArgs = ArkUiTour.StepEffectArgs;

/**
 * A footer action button definition. Extends Ark UI's `StepAction` (label +
 * action type) with arbitrary native `<button>` HTML attributes so consumers
 * can attach `data-analytics-id`, `data-analytics-props`, `aria-*`, `id`,
 * `onClick`, etc. per action without DS-specific slot props.
 *
 * `color` is excluded because the DS Button uses CVA `color` variants; the
 * native HTML `color` attribute would silently win and break the variant
 * lookup. `children` is excluded because the button label comes from `label`.
 */
export type TourStepAction = ArkUiTour.StepAction &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'action'>;

export interface WaitForStepEventOptions<T extends HTMLElement = HTMLElement> {
  /** Only advance when the predicate returns `true`. */
  predicate?: (el: T) => boolean;
  /** Debounce ms — resolve only after this period of inactivity following a passing predicate. */
  delay?: number;
}

export interface TourStepChangeDetails {
  stepIndex: number;
  stepId: string | null;
}

export type TourStepChangeDetailsExtended = ArkUiTour.StepChangeDetails;

export type TourStatusChangeDetails = ArkUiTour.StatusChangeDetails;

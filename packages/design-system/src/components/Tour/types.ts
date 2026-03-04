import type { Tour as ArkUiTour } from '@ark-ui/react';

export type TourStepDetails = ArkUiTour.StepDetails;

export type TourStepAction = ArkUiTour.StepAction;

export type TourStepEffectArgs = ArkUiTour.StepEffectArgs;

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

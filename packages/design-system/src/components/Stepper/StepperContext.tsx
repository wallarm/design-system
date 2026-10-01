import { createContext, useContext } from 'react';
import { useStepsContext } from '@ark-ui/react/steps';
import type { StepperStatusLabels, StepperVisualStatus } from './types';

interface StepperRootContextValue {
  statusLabels?: StepperStatusLabels;
}

export const StepperRootContext = createContext<StepperRootContextValue | undefined>(undefined);

/**
 * Reads the enclosing `Stepper` / `StepperRootProvider`. Called first by every root-level part, so
 * misuse throws a `[Stepper]` error instead of Ark's internal `useStepsContext` one.
 */
export const useStepperRootContext = (part: string): StepperRootContextValue => {
  const context = useContext(StepperRootContext);
  if (!context) {
    throw new Error(`[Stepper] ${part} must be used inside a Stepper or StepperRootProvider.`);
  }
  return context;
};

/** `true` inside a `StepperList`, so a `StepperItem` can tell it is rendered outside one. */
export const StepperListContext = createContext(false);

export interface StepperItemContextValue {
  /** 0-based position, from the item's `index` prop. */
  index: number;
  /** This item is the current step. */
  current: boolean;
  /** This item is the last step: it renders no separator. */
  last: boolean;
  /** Rendered state: `'active'` while current, else the item's `status`. */
  status: StepperVisualStatus;
  /** Screen-reader-only suffix for completed and danger steps, already resolved. */
  statusLabel?: string;
}

export const StepperItemContext = createContext<StepperItemContextValue | undefined>(undefined);

/** Reads the enclosing `StepperItem`: `{ index, current, last, status }`. */
export const useStepperItemContext = (): StepperItemContextValue => {
  const context = useContext(StepperItemContext);
  if (!context) {
    throw new Error('[Stepper] useStepperItemContext must be used inside a StepperItem.');
  }
  return context;
};

/**
 * The current step, clamped to `[0, count - 1]`. Zag accepts `count` as a step (its "completed"
 * state, where no step is current) and checks the range only on mount, so a step can fall out of
 * range; the Stepper always shows one current step.
 */
export const clampStep = (value: number, count: number) =>
  Math.min(Math.max(value, 0), Math.max(count - 1, 0));

export interface UseStepperContextReturn {
  /** Current step, 0-based, always in `[0, count - 1]`. */
  value: number;
  /** Number of steps. */
  count: number;
  /** There is a later step. `false` on the last step. */
  hasNextStep: boolean;
  /** There is an earlier step. `false` on the first step. */
  hasPrevStep: boolean;
  /** Moves to the next step; does nothing on the last step. */
  goToNextStep: () => void;
  /** Moves to the previous step; does nothing on the first step. */
  goToPrevStep: () => void;
  /** Moves to the first step. */
  resetStep: () => void;
  /** Moves to `step`, clamped to `[0, count - 1]`. */
  setStep: (step: number) => void;
}

/**
 * Reads the enclosing `Stepper`. Wraps Ark's `useStepsContext`, with one difference: it never
 * moves past the last step, so there is always a current step (Ark's "completed" state is not
 * part of the Stepper).
 */
export const useStepperContext = (): UseStepperContextReturn => {
  useStepperRootContext('useStepperContext');
  const api = useStepsContext();
  const value = clampStep(api.value, api.count);
  const hasNextStep = value < api.count - 1;
  return {
    value,
    count: api.count,
    hasNextStep,
    hasPrevStep: value > 0,
    goToNextStep: () => {
      if (hasNextStep) api.setStep(value + 1);
    },
    goToPrevStep: () => {
      if (value > 0) api.setStep(value - 1);
    },
    resetStep: api.resetStep,
    setStep: step => api.setStep(clampStep(step, api.count)),
  };
};

import { type UseStepsProps, type UseStepsReturn, useSteps } from '@ark-ui/react/steps';
import { STEPPER_MAX_STEPS } from './constants';
import { clampStep } from './StepperContext';

/** Ark props the Stepper does not support: it never blocks a step and is horizontal only. */
export type StepperOmittedArkProps =
  | 'linear'
  | 'isStepValid'
  | 'isStepSkippable'
  | 'onStepInvalid'
  | 'onStepComplete'
  | 'orientation';

export interface StepperGuardProps {
  /** Number of steps, 1–6. Required: each `StepperItem` and `StepperContent` takes its `index`. */
  count: number;
  /** Controlled current step, 0-based. Clamped to `[0, count - 1]`. */
  step?: number;
  /** Uncontrolled initial step. Default `0`. Clamped to `[0, count - 1]`. */
  defaultStep?: number;
  /**
   * Fires when a click changes the step, back or forward: `({ step }) => void`. A click on the
   * current step does not fire it; use the trigger's `onClick` to observe that.
   */
  onStepChange?: UseStepsProps['onStepChange'];
}

const warn = (message: string) =>
  // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches Slider/BarList).
  console.warn(`[Stepper] ${message}`);

/**
 * The root guards shared by `Stepper` and `useStepper`: clamps `step` / `defaultStep`, warns in
 * development, and never reports a step past the last one (Ark's "completed" state).
 */
export const useStepperGuards = ({ count, step, defaultStep, onStepChange }: StepperGuardProps) => {
  const clamp = (value?: number) => (value === undefined ? undefined : clampStep(value, count));
  const clampedStep = clamp(step);
  const clampedDefaultStep = clamp(defaultStep);

  if (process.env.NODE_ENV !== 'production') {
    if (count > STEPPER_MAX_STEPS) {
      warn(`${count} steps; the design supports up to ${STEPPER_MAX_STEPS}.`);
    }
    if (count < 1) warn(`count=${count}; a Stepper needs at least one step.`);
    if (step !== undefined && step !== clampedStep) {
      warn(`step=${step} is out of range [0, ${count - 1}]; clamped.`);
    }
    if (defaultStep !== undefined && defaultStep !== clampedDefaultStep) {
      warn(`defaultStep=${defaultStep} is out of range [0, ${count - 1}]; clamped.`);
    }
  }

  return {
    count,
    // Only defined values reach Ark, so its own defaultStep (0) still applies.
    ...(clampedStep !== undefined && { step: clampedStep }),
    ...(clampedDefaultStep !== undefined && { defaultStep: clampedDefaultStep }),
    onStepChange: onStepChange
      ? (details: { step: number }) => {
          if (details.step <= count - 1) onStepChange(details);
        }
      : undefined,
  };
};

export interface UseStepperProps
  extends Omit<UseStepsProps, StepperOmittedArkProps | keyof StepperGuardProps>,
    StepperGuardProps {}

export type UseStepperReturn = UseStepsReturn;

/**
 * Creates the Stepper machine outside the component, for `StepperRootProvider`. Wraps Ark's
 * `useSteps` with the same guards as `Stepper` and `useStepperContext`: the step is clamped to
 * `[0, count - 1]`, `setStep` clamps too, and Next / Back move from the shown step, so the machine
 * never reaches Ark's "completed" state (`isCompleted` is always `false`).
 */
export const useStepper = ({
  count,
  step,
  defaultStep,
  onStepChange,
  ...rest
}: UseStepperProps): UseStepperReturn => {
  const guarded = useStepperGuards({ count, step, defaultStep, onStepChange });
  const api = useSteps({ ...rest, ...guarded });
  const value = clampStep(api.value, api.count);
  const hasNextStep = value < api.count - 1;
  const hasPrevStep = value > 0;
  return {
    ...api,
    value,
    percent: api.count > 0 ? (value / api.count) * 100 : 0,
    isCompleted: false,
    hasNextStep,
    hasPrevStep,
    goToNextStep: () => {
      if (hasNextStep) api.setStep(value + 1);
    },
    goToPrevStep: () => {
      if (hasPrevStep) api.setStep(value - 1);
    },
    setStep: next => api.setStep(clampStep(next, api.count)),
  };
};

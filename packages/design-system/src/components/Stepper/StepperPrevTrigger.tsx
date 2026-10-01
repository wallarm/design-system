import type { ButtonHTMLAttributes, FC, MouseEvent, ReactNode, Ref } from 'react';
import { Steps as ArkSteps, useStepsContext } from '@ark-ui/react/steps';
import { type TestableProps, useTestId } from '../../utils/testId';
import { clampStep, useStepperRootContext } from './StepperContext';
import { takeAsChildDisabled } from './takeAsChildDisabled';

export interface StepperPrevTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    TestableProps {
  /** Render the child (e.g. a `Button`) as the trigger instead of a plain `<button>`. */
  asChild?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Moves to the previous step. Disabled on the first step. Use `asChild` with a `Button`; a
 * `disabled` on that child is folded in, so the first step still disables it.
 */
export const StepperPrevTrigger: FC<StepperPrevTriggerProps> = ({
  asChild,
  children,
  disabled,
  onClick,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  useStepperRootContext('StepperPrevTrigger');
  const { value, count, setStep } = useStepsContext();
  // Zag keeps an out-of-range step when an uncontrolled `count` shrinks; step back from the
  // shown (clamped) step, or the first Back clicks would do nothing visible.
  const current = clampStep(value, count);
  const atFirst = current === 0;
  const testId = useTestId('prev-trigger', testIdProp);
  const child = takeAsChildDisabled(asChild, children);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Runs before Ark's handler, which skips a prevented event: the Stepper moves the step itself.
    event.preventDefault();
    if (!atFirst) setStep(current - 1);
  };

  return (
    <ArkSteps.PrevTrigger
      {...rest}
      asChild={asChild}
      ref={ref}
      // A defined value overrides Ark's `disabled`, which reads the raw (unclamped) step.
      disabled={atFirst || disabled || child.childDisabled || undefined}
      onClick={handleClick}
      data-slot='stepper-prev-trigger'
      data-testid={testId}
    >
      {child.children}
    </ArkSteps.PrevTrigger>
  );
};

StepperPrevTrigger.displayName = 'StepperPrevTrigger';

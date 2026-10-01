import type { ButtonHTMLAttributes, FC, MouseEvent, ReactNode, Ref } from 'react';
import { Steps as ArkSteps, useStepsContext } from '@ark-ui/react/steps';
import { type TestableProps, useTestId } from '../../utils/testId';
import { clampStep, useStepperRootContext } from './StepperContext';
import { takeAsChildDisabled } from './takeAsChildDisabled';

export interface StepperNextTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    TestableProps {
  /** Render the child (e.g. a `Button`) as the trigger instead of a plain `<button>`. */
  asChild?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Moves to the next step. Disabled on the last step, where the page renders its own submit
 * button instead: Ark would otherwise move to its "completed" state, with no current step. A
 * `disabled` on an `asChild` child is folded in, so the last step still disables it.
 */
export const StepperNextTrigger: FC<StepperNextTriggerProps> = ({
  asChild,
  children,
  disabled,
  onClick,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  useStepperRootContext('StepperNextTrigger');
  const { value, count } = useStepsContext();
  const atLast = clampStep(value, count) >= count - 1;
  const testId = useTestId('next-trigger', testIdProp);
  const child = takeAsChildDisabled(asChild, children);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    // Runs before Ark's handler, which skips a prevented event: covers asChild children that
    // ignore `disabled`.
    if (atLast) event.preventDefault();
  };

  return (
    <ArkSteps.NextTrigger
      {...rest}
      asChild={asChild}
      ref={ref}
      // A defined value overrides Ark's `disabled`, which stays enabled on the last step.
      disabled={atLast || disabled || child.childDisabled || undefined}
      onClick={handleClick}
      data-slot='stepper-next-trigger'
      data-testid={testId}
    >
      {child.children}
    </ArkSteps.NextTrigger>
  );
};

StepperNextTrigger.displayName = 'StepperNextTrigger';

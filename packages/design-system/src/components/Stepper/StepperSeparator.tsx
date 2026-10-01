import type { FC, HTMLAttributes, Ref } from 'react';
import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { stepperSeparatorLineClassNames, stepperSeparatorVariants } from './classes';
import { useStepperItemContext } from './StepperContext';

export interface StepperSeparatorProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLSpanElement>;
}

/** The line after a step, on its first row. Decorative, and renders nothing on the last step. */
export const StepperSeparator: FC<StepperSeparatorProps> = ({
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { last, status } = useStepperItemContext();
  const testId = useTestId('separator', testIdProp);

  if (last) return null;

  return (
    <ArkSteps.Separator asChild>
      {/* Ark sets no aria-hidden on the separator, so the Stepper does. */}
      <span
        {...rest}
        ref={ref}
        aria-hidden='true'
        data-slot='stepper-separator'
        data-status={status}
        data-testid={testId}
        className={cn(stepperSeparatorVariants(), className)}
      >
        <span className={stepperSeparatorLineClassNames} />
      </span>
    </ArkSteps.Separator>
  );
};

StepperSeparator.displayName = 'StepperSeparator';

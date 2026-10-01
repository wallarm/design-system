import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { Check } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { stepperIndicatorVariants } from './classes';
import { useStepperItemContext } from './StepperContext';
import type { StepperVisualStatus } from './types';

export interface StepperIndicatorProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  /** Replaces the default content: the step number, `!` for danger, a check for completed. */
  children?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

const renderDefault = (status: StepperVisualStatus, index: number) => {
  if (status === 'completed') return <Check size='sm' />;
  if (status === 'danger') return '!';
  return index + 1;
};

/** The step badge. Decorative: Ark marks it `aria-hidden`, the title names the step. */
// TODO(WDS-188): switch to reworked NumericBadge.
export const StepperIndicator: FC<StepperIndicatorProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { index, status } = useStepperItemContext();
  const testId = useTestId('indicator', testIdProp);

  return (
    // Ark adds aria-hidden="true": the step number is decoration next to the title.
    <ArkSteps.Indicator asChild>
      <span
        {...rest}
        ref={ref}
        data-slot='stepper-indicator'
        data-status={status}
        data-testid={testId}
        className={cn(stepperIndicatorVariants({ status }), className)}
      >
        {children ?? renderDefault(status, index)}
      </span>
    </ArkSteps.Indicator>
  );
};

StepperIndicator.displayName = 'StepperIndicator';

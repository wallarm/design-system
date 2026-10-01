import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Steps as ArkSteps, useStepsContext } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { stepperContentVariants } from './classes';
import { ARK_CONTENT_ARIA_RESET } from './constants';
import { clampStep, useStepperRootContext } from './StepperContext';

export interface StepperContentProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  /** 0-based step this body belongs to. */
  index: number;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The body of one step, shown only while that step is current. Every body stays mounted (hidden),
 * so form state survives moving between steps. It is a `group` named by its `StepperTrigger`
 * (Ark's `aria-labelledby`), so render the matching trigger in the same `Stepper`. Set trigger
 * ids with the root `ids.triggerId` prop, not an `id` on `StepperTrigger`: the body only knows the
 * root's ids.
 */
export const StepperContent: FC<StepperContentProps> = ({
  index,
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  useStepperRootContext('StepperContent');
  const { value, count } = useStepsContext();
  const current = index === clampStep(value, count);
  const testId = useTestId(`content-${index}`, testIdProp);

  return (
    <ArkSteps.Content
      index={index}
      {...ARK_CONTENT_ARIA_RESET}
      // A step body is not a tab panel: there are no tabs.
      role='group'
      {...rest}
      ref={ref}
      hidden={!current}
      data-state={current ? 'open' : 'closed'}
      data-slot='stepper-content'
      data-testid={testId}
      className={cn(stepperContentVariants(), className)}
    >
      {children}
    </ArkSteps.Content>
  );
};

StepperContent.displayName = 'StepperContent';

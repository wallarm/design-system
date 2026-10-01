import type { FC, ReactNode, Ref } from 'react';
import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { stepperVariants } from './classes';
import { StepperRootContext } from './StepperContext';
import type { StepperStatusLabels } from './types';
import {
  type StepperGuardProps,
  type StepperOmittedArkProps,
  useStepperGuards,
} from './useStepper';

export interface StepperProps
  extends Omit<ArkSteps.RootProps, StepperOmittedArkProps | keyof StepperGuardProps | 'asChild'>,
    StepperGuardProps,
    TestableProps {
  /** `StepperList`, then optional `StepperContent`s and `StepperPrevTrigger` / `StepperNextTrigger`. */
  children: ReactNode;
  /** Screen-reader-only suffixes for completed and danger steps. */
  statusLabels?: StepperStatusLabels;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A horizontal row of numbered steps for a multi-step flow, such as a create drawer. Every step is
 * a button, so people can move back and forward freely; the page owns each step's status
 * (completed, danger, upcoming) and the current step is always shown as active.
 *
 * Compound, like Ark UI Steps: `StepperList` › `StepperItem index` › `StepperTrigger` (with
 * `StepperIndicator`, `StepperTitle`, `StepperDescription`) and `StepperSeparator`, then optional
 * `StepperContent index`, `StepperPrevTrigger` and `StepperNextTrigger`.
 */
export const Stepper: FC<StepperProps> = ({
  children,
  count,
  step,
  defaultStep,
  onStepChange,
  statusLabels,
  className,
  ref,
  'data-testid': testId,
  ...rest
}) => {
  const guarded = useStepperGuards({ count, step, defaultStep, onStepChange });

  return (
    <ArkSteps.Root
      {...rest}
      {...guarded}
      ref={ref}
      data-slot='stepper'
      data-testid={testId}
      className={cn(stepperVariants(), className)}
    >
      <TestIdProvider value={testId}>
        <StepperRootContext.Provider value={{ statusLabels }}>
          {children}
        </StepperRootContext.Provider>
      </TestIdProvider>
    </ArkSteps.Root>
  );
};

Stepper.displayName = 'Stepper';

import type { FC, ReactNode, Ref } from 'react';
import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { stepperVariants } from './classes';
import { StepperRootContext } from './StepperContext';
import type { StepperStatusLabels } from './types';
import type { UseStepperReturn } from './useStepper';

export interface StepperRootProviderProps
  extends Omit<ArkSteps.RootProviderProps, 'value' | 'asChild'>,
    TestableProps {
  /** The machine from `useStepper()`, so the page can drive the steps from outside. */
  value: UseStepperReturn;
  children: ReactNode;
  /** Screen-reader-only suffixes for completed and danger steps. */
  statusLabels?: StepperStatusLabels;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The `Stepper` root for a machine created with `useStepper()`: the same parts, with the step
 * state owned by the page (e.g. to move steps from a header action).
 */
export const StepperRootProvider: FC<StepperRootProviderProps> = ({
  value,
  children,
  statusLabels,
  className,
  ref,
  'data-testid': testId,
  ...rest
}) => (
  <ArkSteps.RootProvider
    {...rest}
    value={value}
    ref={ref}
    data-slot='stepper'
    data-testid={testId}
    className={cn(stepperVariants(), className)}
  >
    <TestIdProvider value={testId}>
      <StepperRootContext.Provider value={{ statusLabels }}>{children}</StepperRootContext.Provider>
    </TestIdProvider>
  </ArkSteps.RootProvider>
);

StepperRootProvider.displayName = 'StepperRootProvider';

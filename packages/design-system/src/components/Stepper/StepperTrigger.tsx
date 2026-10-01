import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { stepperTriggerVariants } from './classes';
import { ARK_TAB_ARIA_RESET } from './constants';
import { useStepperItemContext } from './StepperContext';

export interface StepperTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    TestableProps {
  /** `StepperIndicator`, `StepperTitle` and an optional `StepperDescription`. */
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The step's button: a click makes the step current. Carries `aria-current="step"` while
 * current, a screen-reader-only status suffix (", Completed" / ", Has errors") and every
 * consumer attribute, so analytics land on the real `<button>`.
 *
 * Set its `id` with the root `ids.triggerId` prop: `StepperContent` is named by the root's trigger
 * id, so an `id` passed here leaves the body's `aria-labelledby` pointing at nothing.
 */
export const StepperTrigger: FC<StepperTriggerProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { current, status, statusLabel } = useStepperItemContext();
  const testId = useTestId('trigger', testIdProp);
  if (process.env.NODE_ENV !== 'production' && rest.id !== undefined) {
    // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches Stepper root).
    console.warn(
      `[Stepper] id="${rest.id}" on StepperTrigger: set trigger ids with the root \`ids.triggerId\` prop, or StepperContent's aria-labelledby points at nothing.`,
    );
  }

  return (
    <ArkSteps.Trigger
      {...ARK_TAB_ARIA_RESET}
      aria-current={current ? 'step' : undefined}
      {...rest}
      ref={ref}
      type='button'
      data-slot='stepper-trigger'
      data-status={status}
      data-testid={testId}
      className={cn(stepperTriggerVariants(), className)}
    >
      {children}
      {statusLabel && <span className='sr-only'>{`, ${statusLabel}`}</span>}
    </ArkSteps.Trigger>
  );
};

StepperTrigger.displayName = 'StepperTrigger';

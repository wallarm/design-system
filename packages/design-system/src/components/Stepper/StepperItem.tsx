import { type FC, type LiHTMLAttributes, type ReactNode, type Ref, useContext } from 'react';
import { Steps as ArkSteps, useStepsContext } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { stepperItemVariants } from './classes';
import { ARK_ITEM_ARIA_RESET, DEFAULT_STEPPER_STATUS_LABELS } from './constants';
import {
  clampStep,
  StepperItemContext,
  type StepperItemContextValue,
  StepperListContext,
  useStepperRootContext,
} from './StepperContext';
import type { StepperItemStatus, StepperVisualStatus } from './types';

export interface StepperItemProps extends LiHTMLAttributes<HTMLLIElement>, TestableProps {
  /** 0-based position of this step. Required, like Ark's `Steps.Item`. */
  index: number;
  /** Status set by the page. Ignored while this item is the current step. Default `'upcoming'`. */
  status?: StepperItemStatus;
  /** Overrides the root `statusLabels` suffix for this item. */
  statusLabel?: string;
  /** `StepperTrigger`, then `StepperSeparator`. */
  children: ReactNode;
  ref?: Ref<HTMLLIElement>;
}

/**
 * One step: an `<li>` holding the step's `StepperTrigger` and its `StepperSeparator`. It resolves
 * the rendered status (active while current, else `status`) for the parts inside it.
 */
export const StepperItem: FC<StepperItemProps> = ({
  index,
  status,
  statusLabel,
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { statusLabels } = useStepperRootContext('StepperItem');
  const inList = useContext(StepperListContext);
  if (process.env.NODE_ENV !== 'production' && !inList) {
    // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches Stepper root).
    console.warn(
      '[Stepper] StepperItem must be rendered inside a StepperList: an <li> outside the <ol> loses the list semantics.',
    );
  }
  const { value, count } = useStepsContext();
  // Zag checks the step range only on mount, so an uncontrolled step can fall out of range when
  // `count` shrinks. Clamp at read time so the last step still renders as current.
  const currentStep = clampStep(value, count);
  const current = index === currentStep;
  if (process.env.NODE_ENV !== 'production' && current && value !== currentStep) {
    // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches Stepper root).
    console.warn(
      `[Stepper] current step ${value} is out of range [0, ${count - 1}]; showing step ${currentStep}.`,
    );
  }
  const testId = useTestId(`item-${index}`, testIdProp);

  // Active is derived from the current step and wins over the page's status.
  const visual: StepperVisualStatus = current ? 'active' : (status ?? 'upcoming');
  const context: StepperItemContextValue = {
    index,
    current,
    last: index === count - 1,
    status: visual,
    statusLabel:
      visual === 'completed' || visual === 'danger'
        ? (statusLabel ?? statusLabels?.[visual] ?? DEFAULT_STEPPER_STATUS_LABELS[visual])
        : undefined,
  };

  return (
    <ArkSteps.Item index={index} asChild {...ARK_ITEM_ARIA_RESET}>
      <li
        {...rest}
        ref={ref}
        data-slot='stepper-item'
        data-status={visual}
        data-testid={testId}
        className={cn(stepperItemVariants(), className)}
      >
        <StepperItemContext.Provider value={context}>
          <TestIdProvider value={testId}>{children}</TestIdProvider>
        </StepperItemContext.Provider>
      </li>
    </ArkSteps.Item>
  );
};

StepperItem.displayName = 'StepperItem';

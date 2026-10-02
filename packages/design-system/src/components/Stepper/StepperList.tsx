import type { FC, OlHTMLAttributes, ReactNode, Ref } from 'react';
import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { stepperListVariants } from './classes';
import { ARK_LIST_ARIA_RESET } from './constants';
import { StepperListContext, useStepperRootContext } from './StepperContext';

export interface StepperListProps extends OlHTMLAttributes<HTMLOListElement>, TestableProps {
  /** `StepperItem`s, each with its `index`. */
  children: ReactNode;
  ref?: Ref<HTMLOListElement>;
}

/**
 * The step bar: an `<ol>` with 24px side insets and 12px bottom padding, as in Figma.
 * Name it with `aria-label` or `aria-labelledby`.
 */
export const StepperList: FC<StepperListProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  useStepperRootContext('StepperList');
  const testId = useTestId('list', testIdProp);

  return (
    <ArkSteps.List asChild {...ARK_LIST_ARIA_RESET}>
      <ol
        {...rest}
        ref={ref}
        data-slot='stepper-list'
        data-testid={testId}
        className={cn(stepperListVariants(), className)}
      >
        <StepperListContext.Provider value>{children}</StepperListContext.Provider>
      </ol>
    </ArkSteps.List>
  );
};

StepperList.displayName = 'StepperList';

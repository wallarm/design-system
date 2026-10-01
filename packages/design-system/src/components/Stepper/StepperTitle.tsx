import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { stepperTitleVariants } from './classes';
import { useStepperItemContext } from './StepperContext';

export interface StepperTitleProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  children: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

/** The step name: one line, ellipsis at 320px, with the full text in a tooltip when it overflows. */
export const StepperTitle: FC<StepperTitleProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { status } = useStepperItemContext();
  const testId = useTestId('title', testIdProp);

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>
        <span
          {...rest}
          data-slot='stepper-title'
          data-status={status}
          data-testid={testId}
          className={cn(stepperTitleVariants({ status }), className)}
        >
          {children}
        </span>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

StepperTitle.displayName = 'StepperTitle';

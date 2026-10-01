import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { stepperDescriptionVariants } from './classes';
import { useStepperItemContext } from './StepperContext';

export interface StepperDescriptionProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  children: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

/** An optional second line under the title, e.g. 'Optional' or 'Request · Lua · HMAC auth'. One line, ellipsis at 320px, with the full text in a tooltip when it overflows. */
export const StepperDescription: FC<StepperDescriptionProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const { status } = useStepperItemContext();
  const testId = useTestId('description', testIdProp);

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger ref={ref as Ref<HTMLElement>}>
        <span
          {...rest}
          data-slot='stepper-description'
          data-status={status}
          data-testid={testId}
          className={cn(stepperDescriptionVariants(), className)}
        >
          {children}
        </span>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

StepperDescription.displayName = 'StepperDescription';

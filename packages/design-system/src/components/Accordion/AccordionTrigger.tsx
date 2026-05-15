import type { FC, ReactNode } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { ChevronDown, ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAccordionSharedContext } from './AccordionContext';
import { accordionIndicatorVariants, accordionTriggerVariants } from './classes';

export interface AccordionTriggerProps {
  children: ReactNode;
  /**
   * Slot rendered on the right side of the trigger. Only used by the `section`
   * variant — useful for action buttons that should appear next to the
   * expand/collapse toggle.
   */
  actions?: ReactNode;
  className?: string;
}

export const AccordionTrigger: FC<AccordionTriggerProps> = ({ children, actions, className }) => {
  const { variant } = useAccordionSharedContext();
  const testId = useTestId('trigger');

  const Indicator = (
    <ArkUiAccordion.ItemIndicator className={cn(accordionIndicatorVariants({ variant }))}>
      {variant === 'section' ? <ChevronDown /> : <ChevronRight />}
    </ArkUiAccordion.ItemIndicator>
  );

  if (variant === 'section') {
    return (
      <ArkUiAccordion.ItemTrigger
        data-testid={testId}
        className={cn(accordionTriggerVariants({ variant }), className)}
      >
        <span className='flex items-center gap-8 min-w-0'>{children}</span>
        <span className='flex items-center gap-8 shrink-0'>
          {actions}
          {Indicator}
        </span>
      </ArkUiAccordion.ItemTrigger>
    );
  }

  return (
    <ArkUiAccordion.ItemTrigger
      data-testid={testId}
      className={cn(accordionTriggerVariants({ variant }), className)}
    >
      {Indicator}
      <span className='min-w-0 truncate'>{children}</span>
    </ArkUiAccordion.ItemTrigger>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';

import type { FC, ReactNode } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAccordionSharedContext } from './AccordionContext';
import { accordionContentInnerVariants, accordionContentVariants } from './classes';

export interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export const AccordionContent: FC<AccordionContentProps> = ({ children, className }) => {
  const { variant } = useAccordionSharedContext();
  const testId = useTestId('content');

  return (
    <ArkUiAccordion.ItemContent
      data-testid={testId}
      className={cn(accordionContentVariants({ variant }), className)}
    >
      <div className={cn(accordionContentInnerVariants({ variant }))}>{children}</div>
    </ArkUiAccordion.ItemContent>
  );
};

AccordionContent.displayName = 'AccordionContent';

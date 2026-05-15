import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAccordionSharedContext } from './AccordionContext';
import { accordionContentInnerVariants, accordionContentVariants } from './classes';

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const AccordionContent: FC<AccordionContentProps> = ({
  ref,
  children,
  className,
  ...rest
}) => {
  const { variant } = useAccordionSharedContext();
  const testId = useTestId('content');

  return (
    <ArkUiAccordion.ItemContent
      ref={ref}
      data-slot='accordion-content'
      data-testid={testId}
      className={cn(accordionContentVariants({ variant }), className)}
      {...rest}
    >
      <div className={cn(accordionContentInnerVariants({ variant }))}>{children}</div>
    </ArkUiAccordion.ItemContent>
  );
};

AccordionContent.displayName = 'AccordionContent';

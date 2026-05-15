import type { FC, ReactNode, Ref } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { ChevronDown, ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAccordionContext } from './AccordionContext';
import {
  accordionIndicatorVariants,
  accordionTriggerTitleVariants,
  accordionTriggerVariants,
} from './classes';

export interface AccordionTriggerProps extends Omit<ArkUiAccordion.ItemTriggerProps, 'type'> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export const AccordionTrigger: FC<AccordionTriggerProps> = ({
  ref,
  children,
  className,
  ...rest
}) => {
  const { variant } = useAccordionContext();
  const testId = useTestId('trigger');

  const indicator = (
    <ArkUiAccordion.ItemIndicator
      className={cn(accordionIndicatorVariants({ variant }))}
      data-slot='accordion-indicator'
    >
      {variant === 'section' ? <ChevronDown /> : <ChevronRight />}
    </ArkUiAccordion.ItemIndicator>
  );

  return (
    <ArkUiAccordion.ItemTrigger
      ref={ref}
      data-slot='accordion-trigger'
      data-testid={testId}
      className={cn(accordionTriggerVariants({ variant }), className)}
      {...rest}
    >
      {variant === 'section' ? (
        <>
          <span className={cn(accordionTriggerTitleVariants({ variant }))}>{children}</span>
          {indicator}
        </>
      ) : (
        <>
          {indicator}
          <span className={cn(accordionTriggerTitleVariants({ variant }))}>{children}</span>
        </>
      )}
    </ArkUiAccordion.ItemTrigger>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';

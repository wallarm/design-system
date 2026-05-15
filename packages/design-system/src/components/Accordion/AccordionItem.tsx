import type { FC, ReactNode } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAccordionSharedContext } from './AccordionContext';
import { accordionItemVariants } from './classes';

export interface AccordionItemProps {
  children: ReactNode;
  /** Unique value for this item — used to control expansion state */
  value: string;
  /** Disable interaction for this specific item */
  disabled?: boolean;
  className?: string;
}

export const AccordionItem: FC<AccordionItemProps> = ({ children, value, disabled, className }) => {
  const { variant } = useAccordionSharedContext();
  const testId = useTestId(`item-${value}`);

  return (
    <ArkUiAccordion.Item
      value={value}
      disabled={disabled}
      data-testid={testId}
      className={cn(accordionItemVariants({ variant }), className)}
    >
      {children}
    </ArkUiAccordion.Item>
  );
};

AccordionItem.displayName = 'AccordionItem';

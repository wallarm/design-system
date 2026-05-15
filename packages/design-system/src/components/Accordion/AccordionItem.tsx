import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAccordionContext } from './AccordionContext';
import { accordionItemVariants } from './classes';

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  /** Unique value for this item — used to control expansion state */
  value: string;
  /** Disable interaction for this specific item */
  disabled?: boolean;
}

export const AccordionItem: FC<AccordionItemProps> = ({
  ref,
  children,
  value,
  disabled,
  className,
  ...rest
}) => {
  const { variant } = useAccordionContext();
  const testId = useTestId(`item-${value}`);

  return (
    <ArkUiAccordion.Item
      ref={ref}
      value={value}
      disabled={disabled}
      data-slot='accordion-item'
      data-testid={testId}
      className={cn(accordionItemVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </ArkUiAccordion.Item>
  );
};

AccordionItem.displayName = 'AccordionItem';

import type { FC, ReactNode, Ref } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { cn } from '../../utils/cn';
import { TestIdProvider, useTestId } from '../../utils/testId';
import { useAccordionContext } from './AccordionContext';
import { accordionItemVariants } from './classes';

export interface AccordionItemProps extends ArkUiAccordion.ItemProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const AccordionItem: FC<AccordionItemProps> = ({
  ref,
  children,
  value,
  className,
  ...rest
}) => {
  const { variant } = useAccordionContext();
  const testId = useTestId(`item-${value}`);

  return (
    <ArkUiAccordion.Item
      ref={ref}
      value={value}
      data-slot='accordion-item'
      data-testid={testId}
      className={cn(accordionItemVariants({ variant }), className)}
      {...rest}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </ArkUiAccordion.Item>
  );
};

AccordionItem.displayName = 'AccordionItem';

import type { FC, ReactNode } from 'react';
import { Accordion as ArkUiAccordion } from '@ark-ui/react/accordion';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AccordionSharedContextProvider, type AccordionVariant } from './AccordionContext';
import { accordionRootVariants } from './classes';

export interface AccordionProps extends TestableProps {
  children: ReactNode;
  /** Visual variant of the accordion */
  variant?: AccordionVariant;
  /** Whether multiple items can be expanded at the same time */
  multiple?: boolean;
  /** Whether an expanded item can be collapsed (when `multiple` is false) */
  collapsible?: boolean;
  /** Controlled expanded item values */
  value?: string[];
  /** Initial expanded item values for uncontrolled usage */
  defaultValue?: string[];
  /** Callback fired when expanded items change */
  onChange?: (value: string[]) => void;
  /** Disable all interaction */
  disabled?: boolean;
  className?: string;
}

/**
 * Accordion component for progressive disclosure of content.
 *
 * Three variants:
 * - `primary` — lightweight row, 40px height, base font.
 * - `secondary` — compact row, 24px height, small muted text.
 * - `section` — bordered panel with title, optional actions and content area.
 *
 * Compose with `AccordionItem`, `AccordionTrigger`, and `AccordionContent`.
 */
export const Accordion: FC<AccordionProps> = ({
  children,
  variant = 'primary',
  multiple = false,
  collapsible = true,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  'data-testid': testId,
}) => {
  const handleChange = ({ value }: { value: string[] }) => {
    onChange?.(value);
  };

  return (
    <AccordionSharedContextProvider value={{ variant }}>
      <ArkUiAccordion.Root
        className={cn(accordionRootVariants({ variant }), className)}
        data-testid={testId}
        data-variant={variant}
        multiple={multiple}
        collapsible={collapsible}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <TestIdProvider value={testId}>{children}</TestIdProvider>
      </ArkUiAccordion.Root>
    </AccordionSharedContextProvider>
  );
};

Accordion.displayName = 'Accordion';

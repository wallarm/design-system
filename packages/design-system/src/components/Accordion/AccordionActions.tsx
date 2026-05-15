import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { accordionActionsVariants } from './classes';

export interface AccordionActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Action slot for the `section` variant — renders as a sibling of
 * `AccordionTrigger` (not nested inside the trigger `<button>`), so clicks
 * on its children do not toggle the accordion.
 */
export const AccordionActions: FC<AccordionActionsProps> = ({
  ref,
  children,
  className,
  ...rest
}) => {
  const testId = useTestId('actions');

  return (
    <div
      ref={ref}
      data-slot='accordion-actions'
      data-testid={testId}
      className={cn(accordionActionsVariants(), className)}
      {...rest}
    >
      {children}
    </div>
  );
};

AccordionActions.displayName = 'AccordionActions';

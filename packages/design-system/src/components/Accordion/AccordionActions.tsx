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
 * `AccordionTrigger` so the buttons inside are not nested in the trigger
 * `<button>` (clicks on them do not toggle the accordion).
 */
export const AccordionActions: FC<AccordionActionsProps> = ({
  ref,
  children,
  className,
  onClick,
  ...rest
}) => {
  const testId = useTestId('actions');

  return (
    <div
      ref={ref}
      data-slot='accordion-actions'
      data-testid={testId}
      className={cn(accordionActionsVariants(), className)}
      onClick={e => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

AccordionActions.displayName = 'AccordionActions';

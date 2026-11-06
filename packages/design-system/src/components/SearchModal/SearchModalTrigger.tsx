import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { useTestId } from '../../utils/testId';

export interface SearchModalTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'value'> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  /** Render as child element */
  asChild?: boolean;
  /** Native button value attribute (string only, matching Ark UI's Dialog.Trigger) */
  value?: string;
}

export const SearchModalTrigger: FC<SearchModalTriggerProps> = ({
  ref,
  children,
  asChild,
  ...props
}) => {
  const testId = useTestId('trigger');

  return (
    <Dialog.Trigger
      {...props}
      ref={ref}
      data-slot='search-modal-trigger'
      data-testid={testId}
      asChild={asChild}
    >
      {children}
    </Dialog.Trigger>
  );
};

SearchModalTrigger.displayName = 'SearchModalTrigger';

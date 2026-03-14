import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type SelectFooterProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

export const SelectFooter: FC<SelectFooterProps> = props => {
  const testId = useTestId('footer');

  return (
    <div
      {...props}
      data-testid={testId}
      className={cn(
        'bg-component-outline-button-bg py-8 px-16 shrink-0 border-t border-border-primary',
      )}
    />
  );
};

SelectFooter.displayName = 'SelectFooter';

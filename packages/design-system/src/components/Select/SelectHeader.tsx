import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type SelectHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

export const SelectHeader: FC<SelectHeaderProps> = props => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      data-testid={testId}
      className={cn('bg-component-outline-button-bg pt-8 px-8 shrink-0')}
    />
  );
};

SelectHeader.displayName = 'SelectHeader';

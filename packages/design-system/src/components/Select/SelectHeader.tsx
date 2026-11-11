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
      className={cn('shrink-0 bg-component-outline-button-bg px-8 pt-8')}
    />
  );
};

SelectHeader.displayName = 'SelectHeader';

import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { DropdownMenuSeparator } from '../DropdownMenu';

export const SelectSeparator: FC = () => {
  const testId = useTestId('separator');

  return <DropdownMenuSeparator data-testid={testId} />;
};

SelectSeparator.displayName = 'SelectSeparator';

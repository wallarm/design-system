import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

export const SelectEmptyState: FC = () => (
  <div className={cn('p-6 text-center')}>
    <Text size='sm' color='secondary'>
      No results
    </Text>
  </div>
);

SelectEmptyState.displayName = 'SelectEmptyState';

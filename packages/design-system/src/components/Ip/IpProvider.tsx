import type { ComponentProps, FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Badge } from '../Badge';

export type IpProviderProps = Omit<ComponentProps<typeof Badge>, 'size' | 'type' | 'color'>;

export const IpProvider: FC<IpProviderProps> = ({ children, ...props }) => {
  const testId = useTestId('provider');

  return (
    <Badge
      {...props}
      size='medium'
      type='secondary'
      color='slate'
      data-slot='ip-provider'
      data-testid={testId}
      className='shrink-0'
    >
      {children}
    </Badge>
  );
};

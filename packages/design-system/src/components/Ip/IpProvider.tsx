import type { ComponentProps, FC } from 'react';
import { Badge } from '../Badge';

export type IpProviderProps = Omit<ComponentProps<typeof Badge>, 'size' | 'type' | 'color'>;

export const IpProvider: FC<IpProviderProps> = ({ children, ...props }) => (
  <Badge
    {...props}
    size='medium'
    type='secondary'
    color='slate'
    data-slot='ip-provider'
    className='shrink-0'
  >
    {children}
  </Badge>
);

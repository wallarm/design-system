import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Code } from '../Code';

export interface IpPortProps {
  children: ReactNode;
}

export const IpPort: FC<IpPortProps> = ({ children, ...props }) => (
  <Code {...props} color='secondary' size='m' data-slot='ip-port' className={cn('shrink ml-[-4]')}>
    {children}
  </Code>
);

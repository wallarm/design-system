import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Code } from '../Code';

export interface IpPortProps {
  children: ReactNode;
}

export const IpPort: FC<IpPortProps> = ({ children, ...props }) => {
  const testId = useTestId('port');

  return (
    <Code
      data-testid={testId}
      {...props}
      color='secondary'
      size='m'
      data-slot='ip-port'
      className={cn('shrink ml-[-4]')}
    >
      {children}
    </Code>
  );
};

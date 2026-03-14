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
      {...props}
      color='secondary'
      size='m'
      data-slot='ip-port'
      data-testid={testId}
      className={cn('shrink ml-[-4]')}
    >
      {children}
    </Code>
  );
};

import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Code } from '../Code';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';

export interface IpAddressProps {
  children: ReactNode;
  className?: string;
}

export const IpAddress: FC<IpAddressProps> = ({ className, children }) => {
  const testId = useTestId('address');

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger asChild>
        <Code size='m' data-slot='ip-address' data-testid={testId} className={cn('truncate')}>
          {children}
        </Code>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

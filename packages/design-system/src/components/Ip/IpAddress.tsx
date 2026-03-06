import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
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

export const IpAddress: FC<IpAddressProps> = ({ className, children }) => (
  <OverflowTooltip>
    <OverflowTooltipTrigger asChild>
      <Code size='m' data-slot='ip-address' className={cn('truncate')}>
        {children}
      </Code>
    </OverflowTooltipTrigger>
    <OverflowTooltipContent>{children}</OverflowTooltipContent>
  </OverflowTooltip>
);

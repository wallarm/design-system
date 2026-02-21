import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TooltipContent } from '../Tooltip';

export interface OverflowTooltipContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?: number;
}

/**
 * Content component for the overflow tooltip.
 */
export const OverflowTooltipContent = ({
  children,
  className,
  maxWidth = 400,
}: OverflowTooltipContentProps) => {
  return (
    <TooltipContent
      className={cn('whitespace-normal wrap-break-word', className)}
      style={{ maxWidth }}
    >
      {children}
    </TooltipContent>
  );
};

OverflowTooltipContent.displayName = 'OverflowTooltipContent';

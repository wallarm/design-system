import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TooltipContent } from '../Tooltip';

export interface OverflowTooltipContentProps {
  children: ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
}

/**
 * Content component for the overflow tooltip.
 * Wraps the TooltipContent from Radix UI.
 */
export const OverflowTooltipContent = ({
  children,
  className,
  side,
  maxWidth = 400,
}: OverflowTooltipContentProps) => {
  return (
    <TooltipContent
      side={side}
      className={cn('whitespace-normal wrap-break-word', className)}
      style={{ maxWidth }}
    >
      {children}
    </TooltipContent>
  );
};

OverflowTooltipContent.displayName = 'OverflowTooltipContent';

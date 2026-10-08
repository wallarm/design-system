import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { PopoverContent, type PopoverContentProps } from '../Popover';
import { useOverflowListContext } from './OverflowListContext';
import { OverflowListMoreItems } from './OverflowListMoreItems';

export interface OverflowListMoreContentProps extends Omit<PopoverContentProps, 'children'> {
  /** Defaults to `<OverflowListMoreItems />`. */
  children?: ReactNode;
}

const DEFAULT_CHILDREN = <OverflowListMoreItems />;

export const OverflowListMoreContent: FC<OverflowListMoreContentProps> = ({
  children = DEFAULT_CHILDREN,
  className,
  minHeight = 'auto',
  maxWidth = '360px',
  ...props
}) => {
  const { measuring } = useOverflowListContext();
  if (measuring) return null;

  return (
    <PopoverContent
      {...props}
      minHeight={minHeight}
      maxWidth={maxWidth}
      className={cn('gap-8', className)}
    >
      {children}
    </PopoverContent>
  );
};

OverflowListMoreContent.displayName = 'OverflowListMoreContent';

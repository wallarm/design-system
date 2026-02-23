import { forwardRef } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';

export type ScrollAreaProps = ArkUiScrollArea.RootProps;

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => (
    <ArkUiScrollArea.Root
      {...props}
      ref={ref}
      className={cn(
        'h-full outline-none',
        // Show thumbs only when content overflows in that direction
        '[&:has([data-overflow-x])_[data-orientation=horizontal]_[data-part=thumb][data-hover]]:opacity-50',
        '[&:has([data-overflow-y])_[data-orientation=vertical]_[data-part=thumb][data-hover]]:opacity-50',
        // Hide scrollbar tracks entirely when no overflow in their direction
        '[&:not(:has([data-overflow-x]))_[data-part=scrollbar][data-orientation=horizontal]]:opacity-0',
        '[&:not(:has([data-overflow-y]))_[data-part=scrollbar][data-orientation=vertical]]:opacity-0',
        className,
      )}
    />
  ),
);

ScrollArea.displayName = 'ScrollArea';

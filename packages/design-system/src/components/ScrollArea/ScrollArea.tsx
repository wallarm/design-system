import type { FC } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';

export type ScrollAreaProps = ArkUiScrollArea.RootProps;

export const ScrollArea: FC<ScrollAreaProps> = ({ className, ...props }) => (
  <ArkUiScrollArea.Root
    {...props}
    className={cn(
      'h-full outline-none [&:has(:is([data-overflow-x],[data-overflow-y]))_[data-part=thumb][data-hover]]:opacity-50',
      className,
    )}
  />
);

ScrollArea.displayName = 'ScrollArea';

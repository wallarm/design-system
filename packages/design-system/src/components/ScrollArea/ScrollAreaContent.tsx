import type { FC } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';

export type ScrollAreaContentProps = ArkUiScrollArea.ContentProps;

export const ScrollAreaContent: FC<ScrollAreaContentProps> = ({ className, ...props }) => (
  <ArkUiScrollArea.Content {...props} className={cn('h-full outline-none', className)} />
);

ScrollAreaContent.displayName = 'ScrollAreaContent';

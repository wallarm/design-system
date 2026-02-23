import type { FC, Ref } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cn } from '../../utils/cn';

export type ScrollAreaViewportProps = Omit<ArkUiScrollArea.ViewportProps, 'className'> & {
  ref?: Ref<HTMLDivElement>;
};

export const ScrollAreaViewport: FC<ScrollAreaViewportProps> = props => (
  <ArkUiScrollArea.Viewport {...props} className={cn('h-full outline-none')} />
);

ScrollAreaViewport.displayName = 'ScrollAreaViewport';

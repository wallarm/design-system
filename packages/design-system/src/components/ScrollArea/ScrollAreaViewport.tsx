import type { FC, Ref } from 'react';
import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';

export type ScrollAreaViewportProps = Omit<ArkUiScrollArea.ViewportProps, 'className'> & {
  ref?: Ref<HTMLDivElement>;
};

export const ScrollAreaViewport: FC<ScrollAreaViewportProps> = props => (
  <ArkUiScrollArea.Viewport {...props} className='h-full' />
);

ScrollAreaViewport.displayName = 'ScrollAreaViewport';

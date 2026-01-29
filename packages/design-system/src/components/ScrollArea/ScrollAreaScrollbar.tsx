import { type CSSProperties, type FC, useMemo } from 'react';

import { ScrollArea as ArkUiScrollArea } from '@ark-ui/react/scroll-area';
import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const scrollAreaScrollbarVariants = cva(
  'bg-transparent rounded-8 transition-opacity overflow-hidden',
  {
    variants: {
      orientation: {
        vertical: 'w-4 mr-3 my-auto',
        horizontal: 'h-4 mb-3 mx-auto',
      },
    },
  },
);

const scrollAreaScrollbarThumbVariants = cva(
  'bg-badge-slate-dark-alt opacity-0 transition-opacity',
  {
    variants: {
      orientation: {
        vertical: 'w-4',
        horizontal: 'h-4',
      },
    },
  },
);

export type ScrollAreaScrollbarProps = Omit<
  ArkUiScrollArea.ScrollbarProps,
  'className' | 'style'
>;

export const ScrollAreaScrollbar: FC<ScrollAreaScrollbarProps> = ({
  orientation = 'vertical',
  ...props
}) => {
  const scrollbarStyle = useMemo<CSSProperties>(() => {
    if (orientation === 'horizontal') {
      return { left: 4, bottom: 4, right: 4 };
    }

    return { top: 4, bottom: 4 };
  }, [orientation]);

  return (
    <ArkUiScrollArea.Scrollbar
      {...props}
      style={scrollbarStyle}
      orientation={orientation}
      className={cn(scrollAreaScrollbarVariants({ orientation }))}
    >
      <ArkUiScrollArea.Thumb
        className={cn(scrollAreaScrollbarThumbVariants({ orientation }))}
      />
    </ArkUiScrollArea.Scrollbar>
  );
};

ScrollAreaScrollbar.displayName = 'ScrollAreaScrollbar';

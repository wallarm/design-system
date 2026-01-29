import type { FC } from 'react';

import { cva } from 'class-variance-authority';

import { ChevronLeft, ChevronRight } from '../../../icons';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import { TABS_SCROLL_BUTTON_WIDTH } from '../constants';
import { useTabsSharedContext } from '../TabsSharedContext';

const scrollButtonVariants = cva(
  [
    // Layout & positioning
    'absolute top-0 bottom-0',
    // Flexbox
    'flex items-center justify-center',
    // Sizing
    `w-${TABS_SCROLL_BUTTON_WIDTH}`,
    // Colors & backgrounds
    'bg-white',
    // Shadows & borders
    'shadow-[0_-1px_0_0_inset_var(--color-slate-200)]',
    // Transitions & animations
    'transition-opacity duration-200',
    // Interactions
    'cursor-pointer',
    // Z-index
    'z-11',
  ].join(' '),
  {
    variants: {
      side: {
        left: [
          // Layout & positioning
          'left-0',
        ].join(' '),
        right: [
          // Layout & positioning
          'right-0',
        ].join(' '),
      },
      visible: {
        true: [
          // Visibility
          'opacity-100',
          // Interactions
          'pointer-events-auto',
        ].join(' '),
        false: [
          // Visibility
          'opacity-0',
          // Interactions
          'pointer-events-none',
        ].join(' '),
      },
    },
  },
);

const scrollGradientVariants = cva(
  cn(
    // Layout & positioning
    'absolute top-0 bottom-2',
    // Sizing
    'w-8',
    // Colors & backgrounds
    'from-white to-transparent bg-gradient-to-r',
    // Interactions
    'pointer-events-none',
    // Z-index
    'z-10',
  ),
  {
    variants: {
      side: {
        left: 'right-[-8px] bg-gradient-to-r',
        right: 'left-[-8px] bg-gradient-to-l',
      },
    },
  },
);

interface TabsListScrollButtonProps {
  direction: 'left' | 'right';
  visible: boolean;
}

export const TabsListScrollButton: FC<TabsListScrollButtonProps> = ({
  direction,
  visible,
}) => {
  const { scrollRef } = useTabsSharedContext();

  const handleClick = () => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth ?? 200;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <div className={cn(scrollButtonVariants({ side: direction, visible }))}>
      <div className={cn(scrollGradientVariants({ side: direction }))} />

      <Button
        variant="ghost"
        color="neutral"
        size="small"
        onClick={handleClick}
        aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      >
        <Icon className="text-slate-900" />
      </Button>
    </div>
  );
};

TabsListScrollButton.displayName = 'TabsListScrollButton';

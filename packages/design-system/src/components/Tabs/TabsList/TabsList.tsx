import {
  type FC,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cva } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { useTabsSharedContext } from '../TabsSharedContext';

import { TabsListIndicator } from './TabsListIndicator';
import { TabsListScrollArea } from './TabsListScrollArea';
import { TabsListScrollButton } from './TabsListScrollButton';

const tabsListVariants = cva(
  [
    // Layout & positioning
    'relative flex items-center',
    // Spacing
    'px-24 gap-4',
    // Shadows & borders
    'border-b-1 border-border-primary-light',
  ].join(' '),
  {
    variants: {
      size: {
        medium: '',
        small: '',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  },
);

interface TabsListProps {
  children: ReactNode;
}

export const TabsList: FC<TabsListProps> = ({ children }) => {
  const { scrollRef, size } = useTabsSharedContext();
  const listRef = useRef<HTMLDivElement>(null);

  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  useLayoutEffect(() => {
    // Check for overflow on the list element first
    const list = listRef.current;

    if (!list) return;

    const checkOverflow = () => {
      const overflow = list.scrollWidth > list.clientWidth;

      setHasOverflow(overflow);

      if (!overflow) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    };

    checkOverflow();

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(list);

    return () => {
      ro.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    // Handle scroll buttons visibility when there's overflow
    if (!hasOverflow) return;

    const el = scrollRef.current;
    if (!el) return;

    const updateScrollButtons = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    updateScrollButtons();

    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);

    el.addEventListener('scroll', updateScrollButtons);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateScrollButtons);
    };
  }, [scrollRef, hasOverflow]);

  return (
    <div className={cn('relative')} data-slot="tabs-list">
      {hasOverflow && (
        <TabsListScrollButton direction="left" visible={canScrollLeft} />
      )}
      <TabsListScrollArea>
        <ArkUiTabs.List
          ref={listRef}
          className={cn(tabsListVariants({ size }))}
        >
          {children}
          <TabsListIndicator />
        </ArkUiTabs.List>
      </TabsListScrollArea>
      {hasOverflow && (
        <TabsListScrollButton direction="right" visible={canScrollRight} />
      )}
    </div>
  );
};

TabsList.displayName = 'TabsList';

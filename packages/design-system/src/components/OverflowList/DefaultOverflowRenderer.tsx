import type { RefObject } from 'react';
import { cn } from '../../utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
import { Text } from '../Text';
import type { ShowAllOverflowData } from './OverflowList';

interface DefaultOverflowRendererProps<T> {
  data: ShowAllOverflowData<T>;
  itemRenderer: (item: T, index: number) => React.ReactNode;
  overflowHeaderLabel?: string;
  showAll: boolean;
  overlayOrigin: boolean;
  dimVisibleItems: boolean;
  overlayOffset: number;
  triggerRef: RefObject<HTMLDivElement | null>;
}

export const DefaultOverflowRenderer = <T,>({
  data,
  itemRenderer,
  overflowHeaderLabel,
  showAll,
  overlayOrigin,
  dimVisibleItems,
  overlayOffset,
  triggerRef,
}: DefaultOverflowRendererProps<T>) => {
  const { allItems, visibleCount, hiddenCount } = data;
  const visibleItems = allItems.slice(0, visibleCount);
  const hiddenItems = allItems.slice(visibleCount);
  const triggerHeight = 32;

  const overlayPositioning = overlayOrigin
    ? {
        placement: 'bottom-start' as const,
        offset: { mainAxis: -triggerHeight, crossAxis: overlayOffset },
      }
    : undefined;

  return (
    <Popover positioning={overlayPositioning}>
      <PopoverTrigger asChild>
        <Tag ref={triggerRef}>+{hiddenCount} more</Tag>
      </PopoverTrigger>
      <PopoverContent className='gap-4' maxWidth='360px' data-overlay-origin={overlayOrigin}>
        {overflowHeaderLabel && showAll && (
          <Text size='sm' weight='medium' color='secondary'>
            {allItems.length} {overflowHeaderLabel}
          </Text>
        )}
        <div className='flex flex-row flex-wrap gap-4'>
          {showAll &&
            visibleItems.map((item, index) => (
              <div
                key={`visible-${index}`}
                className={cn(dimVisibleItems && 'opacity-60')}
                data-visible='true'
              >
                {itemRenderer(item, index)}
              </div>
            ))}
          {hiddenItems.map((item, index) => (
            <div key={`hidden-${index}`} data-visible='false'>
              {itemRenderer(item, visibleCount + index)}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

DefaultOverflowRenderer.displayName = 'DefaultOverflowRenderer';

import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { overflowListMoreItemVariants } from './classes';
import { useOverflowListContext } from './OverflowListContext';

export interface OverflowListMoreItemsProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    TestableProps {
  /** `all` lists every item (visible ones first); `hidden` only the folded ones. */
  show?: 'all' | 'hidden';
  /** Fade the items that are already visible in the row. Only with `show='all'`. */
  dimVisible?: boolean;
  /**
   * Item renderer for the popover. Defaults to the list's `itemRenderer`.
   * `T` is not linked to the list's item type — annotate the parameter.
   */
  renderItem?: (item: T, index: number) => ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const OverflowListMoreItems = <T,>({
  show = 'all',
  dimVisible = true,
  renderItem,
  className,
  'data-testid': testIdProp,
  ...props
}: OverflowListMoreItemsProps<T>) => {
  const testId = useTestId('items', testIdProp);
  const { allItems, hiddenItems, itemRenderer } = useOverflowListContext<T>();
  const render = renderItem ?? itemRenderer;
  // The split is always a prefix/tail, so classify by position — a Set of
  // values would misfile duplicates.
  const firstHidden = allItems.length - hiddenItems.length;
  const itemTestId = testId && `${testId}--item`;

  return (
    <div
      {...props}
      data-slot='overflow-list-more-items'
      data-testid={testId}
      className={cn('flex flex-row flex-wrap gap-4', className)}
    >
      {/* Reset the cascade so item Tags don't inherit the popover's test id. */}
      <TestIdProvider value={undefined}>
        {allItems.map((item, index) => {
          const isHidden = index >= firstHidden;
          if (show === 'hidden' && !isHidden) return null;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: items carry no identity; the source index is stable for a given list
              key={index}
              data-slot='overflow-list-more-item'
              data-testid={itemTestId}
              data-state={isHidden ? 'hidden' : 'visible'}
              className={overflowListMoreItemVariants({ dimmed: dimVisible && !isHidden })}
            >
              {render(item, index)}
            </div>
          );
        })}
      </TestIdProvider>
    </div>
  );
};

OverflowListMoreItems.displayName = 'OverflowListMoreItems';

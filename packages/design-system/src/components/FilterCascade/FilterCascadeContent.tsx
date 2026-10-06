import type { FC, HTMLAttributes, Ref } from 'react';
import { Portal } from '@zag-js/react';
import { Check, ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { useLayerZIndexRef } from '../../utils/syncLayerZIndex';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuClassNames, dropdownMenuItemVariants } from '../DropdownMenu';
import { dropdownMenuItemIndicatorClassName } from '../DropdownMenu/classes';
import { useFilterCascadeContext } from './FilterCascadeContext';
import type { FilterCascadeNode } from './lib';

export interface FilterCascadeContentProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

interface LevelProps {
  node: FilterCascadeNode;
  indexPath: number[];
  value: string[];
}

/**
 * One level, then — if a node in it is highlighted and has children — the next level beside it.
 * The levels sit in one row, so the menu grows to the right as the path deepens.
 */
const Level: FC<LevelProps> = ({ node, indexPath, value }) => {
  const { api } = useFilterCascadeContext();
  const testId = useTestId('level');
  const { collection } = api;
  const nodeState = api.getItemState({ item: node, indexPath, value });
  const next = nodeState.highlightedChild;

  return (
    <>
      <div
        {...api.getListProps({ item: node, indexPath, value })}
        data-slot='filter-cascade-level'
        data-testid={testId}
        className={cn(
          'flex w-240 shrink-0 flex-col gap-1 overflow-y-auto p-8',
          'max-h-[min(340px,var(--available-height))]',
          'not-first:border-l not-first:border-border-primary-light',
        )}
      >
        {collection.getNodeChildren(node).map((item, index) => {
          const itemProps = {
            item,
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
          };
          const state = api.getItemState(itemProps);
          return (
            <div
              key={item.value}
              {...api.getItemProps(itemProps)}
              data-slot='filter-cascade-item'
              className={cn(
                dropdownMenuItemVariants({ variant: 'default' }),
                'items-start data-[state=checked]:bg-states-primary-active',
              )}
            >
              {item.icon && <span className='flex h-20 shrink-0 items-center'>{item.icon}</span>}
              <span className='flex min-w-0 flex-1 flex-col'>
                <span {...api.getItemTextProps(itemProps)} className='truncate'>
                  {item.label}
                </span>
                {item.description && (
                  <span className='text-xs text-text-secondary'>{item.description}</span>
                )}
              </span>
              <span className={cn(dropdownMenuItemIndicatorClassName, 'h-20')}>
                {state.hasChildren ? (
                  <ChevronRight className='text-icon-secondary' />
                ) : (
                  <span {...api.getItemIndicatorProps(itemProps)}>
                    {state.selected && <Check />}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {next && collection.isBranchNode(next) && (
        <Level
          node={next}
          indexPath={[...indexPath, nodeState.highlightedIndex]}
          value={[...value, collection.getNodeValue(next)]}
        />
      )}
    </>
  );
};

/** The menu: the top level, and each deeper level the highlighted path opens. */
export const FilterCascadeContent: FC<FilterCascadeContentProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api } = useFilterCascadeContext();
  const testId = useTestId('content', testIdProp);
  const contentRef = useLayerZIndexRef(ref);

  // Always mounted: Zag positions the panel against a node that exists before it opens, and
  // hides the content itself while closed.
  return (
    <Portal>
      <div {...api.getPositionerProps()} className='outline-none'>
        <div
          {...props}
          {...api.getContentProps()}
          ref={contentRef}
          data-slot='filter-cascade-content'
          data-testid={testId}
          className={cn(dropdownMenuClassNames, 'flex-row gap-0 overflow-hidden p-0', className)}
        >
          <Level node={api.collection.rootNode} indexPath={[]} value={[]} />
        </div>
      </div>
    </Portal>
  );
};

FilterCascadeContent.displayName = 'FilterCascadeContent';

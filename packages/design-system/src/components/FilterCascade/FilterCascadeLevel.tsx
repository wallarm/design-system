import {
  createContext,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { dropdownMenuLabelVariants } from '../DropdownMenu';
import { Skeleton } from '../Skeleton';
import {
  type FilterCascadeEntry,
  type FilterCascadeLevelData,
  PanelSlotsContext,
  useFilterCascade,
  useFilterCascadeContext,
} from './FilterCascadeContext';
import { FilterCascadeItem, type FilterCascadeItemProps } from './FilterCascadeItem';

const CurrentLevel = createContext<FilterCascadeLevelData | null>(null);

const useLevel = (part: string): FilterCascadeLevelData => {
  const level = useContext(CurrentLevel);
  if (!level) throw new Error(`${part} must be rendered inside <FilterCascadeLevel>`);
  return level;
};

export interface FilterCascadeLevelProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** An entry of `levels` from `useFilterCascade`. */
  level: FilterCascadeLevelData;
  /** Defaults to the level's parent option, then its options. */
  children?: ReactNode;
}

/**
 * One level as its own panel (Figma `select-menu`, 320px): the top level opens under the trigger,
 * each next one beside the option that opened it, its first row level with that option. The top
 * level also holds the search and the sections. While lazy options load, the panel shows their
 * outline; if they fail, a retry.
 */
export const FilterCascadeLevel: FC<FilterCascadeLevelProps> = ({
  ref,
  level,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api, retry } = useFilterCascadeContext();
  const { header, footer } = useContext(PanelSlotsContext);
  const testId = useTestId('level', testIdProp);
  const top = level.depth === 0;

  let body: ReactNode;
  if (level.status === 'loading') body = <LevelLoading />;
  else if (level.status === 'error')
    body = (
      <div className='flex items-center justify-between gap-8 py-2 pl-8 text-sm text-text-secondary'>
        Couldn’t load
        <Button variant='ghost' color='neutral' size='small' onClick={() => retry(level.node)}>
          Retry
        </Button>
      </div>
    );
  else
    body = children ?? (
      <>
        <FilterCascadeParentItem />
        <FilterCascadeItems />
      </>
    );

  return (
    <CurrentLevel.Provider value={level}>
      <div
        {...props}
        {...api.getListProps({ item: level.node, indexPath: level.indexPath, value: level.value })}
        ref={ref}
        data-slot='filter-cascade-level'
        data-level={level.depth}
        data-testid={testId}
        className={cn(
          // Figma `select-menu`: the `DropdownMenu` panel, 320px wide.
          'flex w-320 shrink-0 flex-col gap-1 overflow-y-auto overscroll-none',
          'max-h-[min(400px,var(--available-height))]',
          'rounded-12 border border-border-primary-light bg-bg-surface-2 p-8 shadow-md',
          // Each next level overlaps the previous panel's edge, as nested menus do.
          'not-first:-ml-4',
          className,
        )}
      >
        {top && header}
        {body}
        {top && footer}
      </div>
    </CurrentLevel.Provider>
  );
};

FilterCascadeLevel.displayName = 'FilterCascadeLevel';

/** Three option outlines: what a lazy level shows while its options load. */
const LevelLoading: FC = () => (
  <div aria-busy data-slot='filter-cascade-level-loading' className='flex flex-col gap-1'>
    {[64, 48, 56].map(width => (
      <div key={width} className='flex items-center gap-8 px-8 py-8'>
        <Skeleton width='16px' height='16px' rounded='full' />
        <Skeleton width={`${width}%`} height='12px' rounded={4} />
      </div>
    ))}
  </div>
);

export interface FilterCascadeItemsProps {
  /** Which of the level's options to render; all of them by default. */
  filter?: (item: FilterCascadeEntry) => boolean;
  /** Renders one option; a default `FilterCascadeItem` otherwise. */
  children?: (item: FilterCascadeEntry) => ReactNode;
}

/** The current level's options (without its parent option), in order. */
export const FilterCascadeItems: FC<FilterCascadeItemsProps> = ({ filter, children }) => {
  const level = useLevel('FilterCascadeItems');
  const items = filter ? level.items.filter(filter) : level.items;
  return items.map(item =>
    children ? (
      <ItemSlot key={item.node.value}>{children(item)}</ItemSlot>
    ) : (
      <FilterCascadeItem key={item.node.value} item={item} />
    ),
  );
};

FilterCascadeItems.displayName = 'FilterCascadeItems';

/** Keys a consumer-rendered option without adding a node. */
const ItemSlot: FC<{ children: ReactNode }> = ({ children }) => children;

export type FilterCascadeParentItemProps = Omit<FilterCascadeItemProps, 'item'>;

/** The current level's parent option — «Deployment level» — when the root has `parentLabel`. */
export const FilterCascadeParentItem: FC<FilterCascadeParentItemProps> = props => {
  const level = useLevel('FilterCascadeParentItem');
  return level.parentItem ? <FilterCascadeItem {...props} item={level.parentItem} /> : null;
};

FilterCascadeParentItem.displayName = 'FilterCascadeParentItem';

export interface FilterCascadeLevelsProps {
  /** Lays a level's rows out; the default is its parent option, then its options. */
  children?: (level: FilterCascadeLevelData) => ReactNode;
}

/**
 * Every open level as a `FilterCascadeLevel` — what `FilterCascadeContent` renders on its own.
 * Pass a function to lay a level's rows out: group labels, an option set apart. While the search
 * shows its list, the top panel holds the matches as they are; when it matches nothing, says so.
 */
export const FilterCascadeLevels: FC<FilterCascadeLevelsProps> = ({ children }) => {
  const { levels, isEmpty, isSearchList } = useFilterCascade();
  const rows = (level: FilterCascadeLevelData) => {
    if (isEmpty) return <FilterCascadeEmpty />;
    // The search list is one plain level — matches with their paths, no groups to lay out.
    if (isSearchList) return undefined;
    return children?.(level);
  };
  return levels.map(level => (
    <FilterCascadeLevel key={level.depth} level={level}>
      {rows(level)}
    </FilterCascadeLevel>
  ));
};

FilterCascadeLevels.displayName = 'FilterCascadeLevels';

export interface FilterCascadeGroupLabelProps
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** A caption over the options that follow it — «Deployments», «Applications». */
export const FilterCascadeGroupLabel: FC<FilterCascadeGroupLabelProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('group-label', testIdProp);
  return (
    <div
      {...props}
      data-slot='filter-cascade-group-label'
      data-testid={testId}
      className={cn(dropdownMenuLabelVariants({ inset: false }), className)}
    />
  );
};

FilterCascadeGroupLabel.displayName = 'FilterCascadeGroupLabel';

export interface FilterCascadeEmptyProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** The row the top panel shows when the search matches nothing. Defaults to «No results». */
export const FilterCascadeEmpty: FC<FilterCascadeEmptyProps> = ({
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('empty', testIdProp);
  return (
    <div
      {...props}
      data-slot='filter-cascade-empty'
      data-testid={testId}
      className={cn('px-8 py-10 text-center text-sm text-text-secondary', className)}
    >
      {children ?? 'No results'}
    </div>
  );
};

FilterCascadeEmpty.displayName = 'FilterCascadeEmpty';

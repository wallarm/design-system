import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuLabelVariants } from '../DropdownMenu';
import {
  type FilterCascadeLevelData,
  useFilterCascade,
  useFilterCascadeContext,
} from './FilterCascadeContext';
import { FilterCascadeItem } from './FilterCascadeItem';

export interface FilterCascadeLevelProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** An entry of `levels` from `useFilterCascade`. */
  level: FilterCascadeLevelData;
  /** Defaults to a `FilterCascadeItem` per item. */
  children?: ReactNode;
}

/** One column of the menu: the items of one level. Columns after the first get a divider. */
export const FilterCascadeLevel: FC<FilterCascadeLevelProps> = ({
  ref,
  level,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api } = useFilterCascadeContext();
  const testId = useTestId('level', testIdProp);

  return (
    <div
      {...props}
      {...api.getListProps({ item: level.node, indexPath: level.indexPath, value: level.value })}
      ref={ref}
      data-slot='filter-cascade-level'
      data-testid={testId}
      className={cn(
        'flex w-240 shrink-0 flex-col gap-1 overflow-y-auto p-8',
        'max-h-[min(340px,var(--available-height))]',
        'not-first:border-l not-first:border-border-primary-light',
        className,
      )}
    >
      {children ?? level.items.map(item => <FilterCascadeItem key={item.node.value} item={item} />)}
    </div>
  );
};

FilterCascadeLevel.displayName = 'FilterCascadeLevel';

/** Every open level with its default items — what `FilterCascadeContent` renders on its own. */
export const FilterCascadeLevels: FC = () => {
  const { levels, isEmpty } = useFilterCascade();
  if (isEmpty) return <FilterCascadeEmpty />;
  return (
    <>
      {levels.map(level => (
        <FilterCascadeLevel key={level.depth} level={level} />
      ))}
    </>
  );
};

FilterCascadeLevels.displayName = 'FilterCascadeLevels';

export interface FilterCascadeGroupLabelProps
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** A caption over the items that follow it in a level — «Deployments», «Applications». */
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

/** Shown in place of the levels when the search matches nothing. Defaults to «No results». */
export const FilterCascadeEmpty: FC<FilterCascadeEmptyProps> = ({
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { isEmpty } = useFilterCascade();
  const testId = useTestId('empty', testIdProp);
  if (!isEmpty) return null;
  return (
    <div
      {...props}
      data-slot='filter-cascade-empty'
      data-testid={testId}
      className={cn('w-240 px-16 py-12 text-center text-sm text-text-secondary', className)}
    >
      {children ?? 'No results'}
    </div>
  );
};

FilterCascadeEmpty.displayName = 'FilterCascadeEmpty';

import { Children, type FC, isValidElement, type ReactNode, type Ref } from 'react';
import type { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { SelectContent } from '../Select/SelectContent';
import { SelectHeader } from '../Select/SelectHeader';
import { SelectPositioner } from '../Select/SelectPositioner';
import { filterDropdownContentClassName } from './classes';
import { useFilterDropdownContext } from './FilterDropdownContext';
import { FilterDropdownFooter } from './FilterDropdownFooter';
import { FilterDropdownSearch } from './FilterDropdownSearch';

export interface FilterDropdownContentProps
  extends Omit<ArkUiSelect.ContentProps, 'asChild' | 'children'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

/**
 * The menu panel. `FilterDropdownSearch` children are pinned above the scrolling list and
 * `FilterDropdownFooter` children below it; everything else scrolls. Hugs its options up to
 * 360px and at most 340px tall, and keeps its width while a query narrows the list.
 */
export const FilterDropdownContent: FC<FilterDropdownContentProps> = ({
  ref,
  className,
  style,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { isSearchable, isSearchActive, lockedWidth, contentRef } = useFilterDropdownContext();
  const testId = useTestId('content', testIdProp);
  const listTestId = useTestId('list');
  const baseTestId = useTestId();

  const header: ReactNode[] = [];
  const footer: ReactNode[] = [];
  const body: ReactNode[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === FilterDropdownSearch) header.push(child);
    else if (isValidElement(child) && child.type === FilterDropdownFooter) footer.push(child);
    else body.push(child);
  });

  // A measured width cannot be a class; it is applied only while a query is active.
  const width = isSearchActive && lockedWidth ? lockedWidth : undefined;

  return (
    <SelectPositioner
      className={cn(filterDropdownContentClassName, className)}
      contentProps={{
        ...props,
        ref: mergeRefs(ref, contentRef),
        style: width === undefined ? style : { ...style, width },
        'data-slot': 'filter-dropdown-content',
        'data-testid': testId,
      }}
    >
      {isSearchable && header.length > 0 && <SelectHeader>{header}</SelectHeader>}
      {/* Zag gives the list tabIndex 0 but no role in composite mode; keep it out of the initial
          focus and the Tab order so focus lands on the content (role=listbox with
          aria-activedescendant). Keyboard handling lives on the content and is unaffected. */}
      <SelectContent data-testid={listTestId} tabIndex={-1} data-no-autofocus=''>
        {/* The list's ScrollArea starts its own test-id cascade; restore the root's for the parts. */}
        <TestIdProvider value={baseTestId}>{body}</TestIdProvider>
      </SelectContent>
      {footer}
    </SelectPositioner>
  );
};

FilterDropdownContent.displayName = 'FilterDropdownContent';

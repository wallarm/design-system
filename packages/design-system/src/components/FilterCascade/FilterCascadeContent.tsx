import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
} from 'react';
import { Portal } from '@zag-js/react';
import { cn } from '../../utils/cn';
import { useLayerZIndexRef } from '../../utils/syncLayerZIndex';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuClassNames } from '../DropdownMenu';
import { useFilterCascadeContext } from './FilterCascadeContext';
import { FilterCascadeLevels } from './FilterCascadeLevel';
import { FilterCascadeSearch } from './FilterCascadeSearch';
import { FilterCascadeSection } from './FilterCascadeSection';

export interface FilterCascadeContentProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * `FilterCascadeSearch` is pinned on top and `FilterCascadeSection`s at the bottom, both full
   * width; everything else sits in the row of levels between them. With no levels given, every
   * open level is rendered with its default items.
   */
  children?: ReactNode;
}

const isPart = (child: ReactNode, part: FC<never>) => isValidElement(child) && child.type === part;

/** The menu: search on top, the levels side by side, sections under them. */
export const FilterCascadeContent: FC<FilterCascadeContentProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api } = useFilterCascadeContext();
  const testId = useTestId('content', testIdProp);
  const contentRef = useLayerZIndexRef(ref);

  const header: ReactNode[] = [];
  const footer: ReactNode[] = [];
  const body: ReactNode[] = [];
  Children.forEach(children, child => {
    if (isPart(child, FilterCascadeSearch)) header.push(child);
    else if (isPart(child, FilterCascadeSection)) footer.push(child);
    else body.push(child);
  });

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
          className={cn(dropdownMenuClassNames, 'gap-0 overflow-hidden p-0', className)}
        >
          {header}
          <div className='flex min-h-0'>{body.length > 0 ? body : <FilterCascadeLevels />}</div>
          {footer}
        </div>
      </div>
    </Portal>
  );
};

FilterCascadeContent.displayName = 'FilterCascadeContent';

import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useRef,
} from 'react';
import { Portal } from '@zag-js/react';
import { cn } from '../../utils/cn';
import { useLayerZIndexRef } from '../../utils/syncLayerZIndex';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuClassNames } from '../DropdownMenu';
import { PanelSlotsContext, useFilterCascadeContext } from './FilterCascadeContext';
import { FilterCascadeLevels } from './FilterCascadeLevel';
import { FilterCascadeSearch } from './FilterCascadeSearch';
import { FilterCascadeSection } from './FilterCascadeSection';

export interface FilterCascadeContentProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /**
   * `FilterCascadeSearch` goes on top of the top-level panel and `FilterCascadeSection`s at its
   * bottom; everything else is the row of levels. With no levels given, `FilterCascadeLevels`.
   */
  children?: ReactNode;
}

const isPart = (child: ReactNode, part: FC<never>) => isValidElement(child) && child.type === part;

/** The panels' first row padding plus border: a next panel's top sits this far above its opener. */
const PANEL_INSET = 9;

/**
 * The menu: the levels' panels side by side. The top one opens under the trigger; each next one is
 * moved down so its first row lines up with the option that opened it, as nested menus do.
 */
export const FilterCascadeContent: FC<FilterCascadeContentProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api } = useFilterCascadeContext();
  const testId = useTestId('content', testIdProp);
  const layerRef = useLayerZIndexRef(ref);
  const rowRef = useRef<HTMLDivElement>(null);

  const header: ReactNode[] = [];
  const footer: ReactNode[] = [];
  const body: ReactNode[] = [];
  Children.forEach(children, child => {
    if (isPart(child, FilterCascadeSearch)) header.push(child);
    else if (isPart(child, FilterCascadeSection)) footer.push(child);
    else body.push(child);
  });

  // After every render — the highlight moves, a level loads — line each next panel up with its
  // opener, measured in the previous panel as it is scrolled now.
  useLayoutEffect(() => {
    const panels = rowRef.current?.querySelectorAll<HTMLElement>(
      ':scope > [data-slot=filter-cascade-level]',
    );
    if (!panels) return;
    let offset = 0;
    panels.forEach((panel, depth) => {
      if (depth === 0) {
        panel.style.marginTop = '';
        return;
      }
      const previous = panels[depth - 1] as HTMLElement;
      const opener = previous.querySelector<HTMLElement>(
        `[data-slot=filter-cascade-item][data-highlighted][data-depth="${depth}"]`,
      );
      if (opener)
        offset +=
          opener.getBoundingClientRect().top - previous.getBoundingClientRect().top - PANEL_INSET;
      panel.style.marginTop = `${Math.max(offset, 0)}px`;
    });
  });

  // Always mounted: Zag positions the menu against a node that exists before it opens, and hides
  // the content itself while closed.
  return (
    <Portal>
      <div {...api.getPositionerProps()} className='outline-none'>
        <div
          {...props}
          {...api.getContentProps()}
          ref={layerRef}
          data-slot='filter-cascade-content'
          data-testid={testId}
          // The `DropdownMenu` layer and motion; the panels carry the surface themselves.
          className={cn(
            dropdownMenuClassNames,
            'overflow-visible rounded-none border-0 bg-transparent p-0 shadow-none',
            className,
          )}
        >
          <PanelSlotsContext.Provider value={{ header, footer }}>
            <div ref={rowRef} className='flex items-start'>
              {body.length > 0 ? body : <FilterCascadeLevels />}
            </div>
          </PanelSlotsContext.Provider>
        </div>
      </div>
    </Portal>
  );
};

FilterCascadeContent.displayName = 'FilterCascadeContent';

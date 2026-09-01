import { type FC, Fragment, useMemo, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../../DropdownMenu';
import { useFloatingRecomputeOn } from '../../hooks/useFloatingRecomputeOn';
import { buildValueMenuSections, type ValueMenuRow } from '../../lib/buildValueMenuSections';
import { MenuEmptyState } from '../MenuEmptyState';
import type { FilterInputValueMenuProps } from './FilterInputValueMenu';
import { NestedValueMenuItem } from './NestedValueMenuItem';
import { SELECT_ALL_ID, useNestedValueMenuState } from './useNestedValueMenuState';
import { ValueMenuFooterHints } from './ValueMenuFooterHints';

/**
 * Value menu with nesting: top-level options are grouped under section headers
 * and a parent category opens a right-side submenu of its leaf sub-values
 * (multi-select). Only committable leaves reach the expression — sections and
 * parent categories are presentational. Rendered by `FilterInputValueMenu` when
 * the field's values contain groups/sections; the flat menu handles the rest.
 */
export const NestedValueMenu: FC<FilterInputValueMenuProps> = ({
  values,
  onSelect,
  onCommit,
  open = false,
  onOpenChange,
  onEscape,
  multiSelect = false,
  initialValues = [],
  width = 'standard',
  positioning,
  onBuildingValueChange,
  onItemToggle,
  inputRef,
  filterText = '',
  menuRef,
  blurCommitRef,
  className,
}) => {
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const rowElsRef = useRef<Map<string, HTMLElement>>(new Map());

  const sections = useMemo(
    () => buildValueMenuSections(values, filterText, multiSelect),
    [values, filterText, multiSelect],
  );

  const state = useNestedValueMenuState({
    sections,
    allValues: values,
    open,
    multiSelect,
    initialValues,
    onSelect,
    onCommit,
    onEscape,
    onOpenChange,
    onBuildingValueChange,
    onItemToggle,
    inputRef,
    menuRef,
    submenuRef,
    blurCommitRef,
  });

  const widthClass = width === 'compact' ? 'w-[172px]' : 'w-[300px]';
  const widthStyle = typeof width === 'number' ? { width: `${width}px` } : undefined;

  const setRowRef = (id: string) => (el: HTMLElement | null) => {
    state.registerTopItem(id)(el);
    if (el) rowElsRef.current.set(id, el);
    else rowElsRef.current.delete(id);
  };

  // Read the open parent through a ref so `getAnchorRect` keeps a stable
  // identity — zag captures it once at open, so closing over `openParentId`
  // directly would freeze the submenu on the row that opened it and every later
  // parent would render its own rows at the first one's position.
  const openParentIdRef = useRef(state.openParentId);
  openParentIdRef.current = state.openParentId;

  const submenuPositioning = useMemo(
    () => ({
      placement: 'right-start' as const,
      // Small gutter tucks the submenu ~4px under the main menu's right edge
      // (overlap past the checkbox column, not a gap): shortens the diagonal
      // corridor and widens the aim target, so the hover-intent close delay —
      // the only thing protecting the traverse — has time to be cancelled by
      // the panel's own mouseenter.
      gutter: 4,
      getAnchorRect: () => {
        const id = openParentIdRef.current;
        return (id && rowElsRef.current.get(id)?.getBoundingClientRect()) || null;
      },
    }),
    [],
  );

  // The anchor is virtual, so floating-ui has nothing to observe when the open
  // parent changes — poke it to recompute against the new row.
  useFloatingRecomputeOn(state.openParentId, state.openParentId != null);

  const openParentRow = state.openParentRow;

  // The submenu's own "All {group}" bulk-select row — same visual language as
  // the section-level one, toggling every sub-value of the open parent category.
  // Only in multi-select: bulk-selecting a whole group is meaningless when the
  // operator commits a single value.
  const submenuSelectAllRow: ValueMenuRow | null =
    openParentRow && multiSelect
      ? {
          id: SELECT_ALL_ID,
          option: {
            label: `All ${openParentRow.option.label}`,
            children: openParentRow.option.children ?? [],
          },
          isGroup: true,
          isSelectAll: true,
        }
      : null;

  const hasRows = sections.some(section => section.rows.length > 0);

  return (
    <>
      <DropdownMenu
        open={open}
        onOpenChange={onOpenChange}
        closeOnSelect={false}
        positioning={positioning}
        highlightedValue={state.topHighlightedValue}
        onHighlightChange={state.onTopHighlightChange}
      >
        <DropdownMenuContent
          ref={menuRef}
          className={cn(widthClass, 'max-h-[430px]', className)}
          style={widthStyle}
          data-filter-input-menu='true'
        >
          {hasRows ? (
            sections.map((section, index) => {
              const rows = (
                <DropdownMenuGroup className='flex flex-col gap-1'>
                  {section.rows.map(row => {
                    // A real parent category opens a submenu on hover; the
                    // synthetic "All {group}" row is a group for check-state but
                    // never a submenu trigger.
                    const isParent = row.isGroup && !row.isSelectAll;
                    return (
                      <NestedValueMenuItem
                        key={row.id}
                        id={row.id}
                        option={row.option}
                        isGroup={isParent}
                        checkedState={state.getRowCheckState(row)}
                        isPending={state.topPendingIds.has(row.id)}
                        multiSelect={multiSelect}
                        onSelect={() => state.selectRow(row, false)}
                        onMouseEnter={isParent ? () => state.openParent(row.id) : undefined}
                        onMouseLeave={isParent ? () => state.scheduleClose() : undefined}
                        registerRef={setRowRef(row.id)}
                        expanded={state.openParentId === row.id}
                        selectAll={row.isSelectAll}
                        highlight={filterText}
                      />
                    );
                  })}
                </DropdownMenuGroup>
              );
              return (
                <Fragment key={section.label ?? `section-${index}`}>
                  {index > 0 && <DropdownMenuSeparator />}
                  {section.label ? (
                    // Per-section wrapper bounds the sticky header so it pins to
                    // the top only while its own group is in view, then is pushed
                    // out by the next group's header.
                    <div className='flex flex-col gap-1'>
                      <DropdownMenuLabel sticky>{section.label}</DropdownMenuLabel>
                      {rows}
                    </div>
                  ) : (
                    rows
                  )}
                </Fragment>
              );
            })
          ) : (
            <MenuEmptyState />
          )}
          <DropdownMenuFooter className='justify-start'>
            <ValueMenuFooterHints multiSelect={multiSelect} />
          </DropdownMenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Submenu. No onOpenChange on purpose: a controlled, trigger-less
          Menu.Root fires transient `false` events (no focus inside) that would
          fight the hover-intent. The submenu's open lifecycle is owned entirely
          by hover-intent (mouse), ArrowLeft/Escape (keyboard), and the parent
          menu closing — never by Ark's own dismissal. */}
      {openParentRow && (
        <DropdownMenu
          open={state.openParentId != null}
          closeOnSelect={false}
          positioning={submenuPositioning}
          highlightedValue={state.submenuHighlightedValue}
          onHighlightChange={state.onSubmenuHighlightChange}
        >
          <DropdownMenuContent
            ref={submenuRef}
            className={cn(widthClass, 'max-h-[430px]')}
            style={widthStyle}
            data-filter-input-menu='true'
            onMouseEnter={state.cancelClose}
            onMouseLeave={state.scheduleClose}
          >
            <DropdownMenuGroup className='flex flex-col gap-1'>
              {submenuSelectAllRow && (
                <NestedValueMenuItem
                  id={SELECT_ALL_ID}
                  option={submenuSelectAllRow.option}
                  isGroup={false}
                  checkedState={state.getRowCheckState(submenuSelectAllRow)}
                  isPending={state.submenuPendingIds.has(SELECT_ALL_ID)}
                  multiSelect={multiSelect}
                  onSelect={() => state.toggleGroup(openParentRow.option)}
                  registerRef={state.registerSubmenuItem(SELECT_ALL_ID)}
                  selectAll
                />
              )}
              {submenuSelectAllRow && <DropdownMenuSeparator />}
              {state.submenuRows.map(row => (
                <NestedValueMenuItem
                  key={row.id}
                  id={row.id}
                  option={row.option}
                  isGroup={row.isGroup}
                  checkedState={state.getRowCheckState(row)}
                  isPending={state.submenuPendingIds.has(row.id)}
                  multiSelect={multiSelect}
                  onSelect={() => state.selectRow(row, true)}
                  registerRef={state.registerSubmenuItem(row.id)}
                />
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

NestedValueMenu.displayName = 'NestedValueMenu';

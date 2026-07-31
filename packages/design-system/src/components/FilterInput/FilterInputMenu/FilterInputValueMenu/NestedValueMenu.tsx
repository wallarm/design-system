import { type FC, Fragment, useMemo, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../../DropdownMenu';
import { Text } from '../../../Text';
import { buildValueMenuSections } from '../../lib/buildValueMenuSections';
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

  const sections = useMemo(() => buildValueMenuSections(values, filterText), [values, filterText]);

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

  const submenuPositioning = useMemo(
    () => ({
      placement: 'right-start' as const,
      gutter: 8,
      getAnchorRect: () =>
        (state.openParentId &&
          rowElsRef.current.get(state.openParentId)?.getBoundingClientRect()) ||
        null,
    }),
    [state.openParentId],
  );

  const openParentRow = state.openParentRow;
  const allChecked = openParentRow ? state.allLeavesChecked(openParentRow.option) : false;

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
            sections.map((section, index) => (
              <Fragment key={section.label ?? `section-${index}`}>
                {index > 0 && <DropdownMenuSeparator />}
                {section.label && <DropdownMenuLabel>{section.label}</DropdownMenuLabel>}
                <DropdownMenuGroup>
                  {section.rows.map(row => (
                    <NestedValueMenuItem
                      key={row.id}
                      id={row.id}
                      option={row.option}
                      isGroup={row.isGroup}
                      checkedState={state.getRowCheckState(row)}
                      isPending={state.topPendingIds.has(row.id)}
                      multiSelect={multiSelect}
                      onSelect={() => state.selectRow(row, false)}
                      onMouseEnter={row.isGroup ? () => state.openParent(row.id) : undefined}
                      onMouseLeave={row.isGroup ? () => state.scheduleClose() : undefined}
                      registerRef={setRowRef(row.id)}
                      expanded={state.openParentId === row.id}
                    />
                  ))}
                </DropdownMenuGroup>
              </Fragment>
            ))
          ) : (
            <MenuEmptyState />
          )}
          <DropdownMenuFooter>
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
            <DropdownMenuGroup>
              <DropdownMenuItem
                value={SELECT_ALL_ID}
                ref={state.registerSubmenuItem(SELECT_ALL_ID)}
                onSelect={() => state.toggleGroup(openParentRow.option)}
                className={
                  state.submenuPendingIds.has(SELECT_ALL_ID) ? 'bg-states-primary-hover' : undefined
                }
              >
                <Text size='sm' color='secondary'>
                  {allChecked ? 'Unselect all' : 'Select all'}
                </Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

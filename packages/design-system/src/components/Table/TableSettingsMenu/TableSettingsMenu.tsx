import {
  type ButtonHTMLAttributes,
  cloneElement,
  type FC,
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Settings } from '../../../icons';
import { cn } from '../../../utils/cn';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import { Separator } from '../../Separator';
import { VStack } from '../../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { collectDirectChildren, TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID } from '../lib';
import { useTableContext } from '../TableContext';
import { TableSettingsMenuContentProvider } from './TableSettingsMenuContentContext';
import { useTableSettingsMenuContext } from './TableSettingsMenuContext';
import { TableSettingsMenuItem } from './TableSettingsMenuItem';
import { TableSettingsMenuReset } from './TableSettingsMenuReset';
import { TableSettingsMenuSearch } from './TableSettingsMenuSearch';

const DEFAULT_HEADER_HEIGHT = 34;
const HEADER_HEIGHT_WITH_DESCRIPTION = 50;

export interface TableSettingsMenuProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'type'>,
    TestableProps {
  /**
   * Forwarded to the trigger `<button>` (focus management, measurement,
   * ref-based instrumentation). `ButtonHTMLAttributes` does not carry `ref`, so
   * it is declared explicitly; it flows through `{...rest}` to `<Button>`.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Optional override sub-components — `TableSettingsMenuItem` (addressed by
   * `columnId`), `TableSettingsMenuReset`, `TableSettingsMenuSearch`. Each one
   * supplied replaces only its own slot; every other item renders the DS
   * default. DnD, grouping, and filtering remain DS-owned.
   */
  children?: ReactNode;
}

export const TableSettingsMenu: FC<TableSettingsMenuProps> = ({
  'data-testid': testIdProp,
  children,
  ...rest
}) => {
  const testId = useTestId('settings-menu', testIdProp);
  const { anchorNode } = useTableSettingsMenuContext();
  const ctx = useTableContext();
  const { table, alwaysPinnedLeft, masterColumnId, columnGroups, onSettingsOpenChange } = ctx;

  const hasTextDescription = table
    .getAllLeafColumns()
    .some(col => col.columnDef.meta?.description?.type === 'text');

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock the menu to its unfiltered width on open so typing in the search field
  // (which drops rows and changes the widest visible one) never resizes it —
  // the width the user first sees is kept for the whole session (AS-1431).
  const contentRef = useRef<HTMLDivElement>(null);
  const [lockedWidth, setLockedWidth] = useState<number>();

  const handleOpenChange = (open: boolean) => {
    setMenuOpen(open);
    // Fresh search each open, so the lock below always measures the full list.
    if (open) setSearch('');
    else setLockedWidth(undefined);
    onSettingsOpenChange?.(open);
  };

  // Measure the natural (full-list) width once the portaled content has mounted,
  // then pin it. rAF-retries until the Ark portal is in the DOM.
  useLayoutEffect(() => {
    if (!menuOpen) return;
    let raf = requestAnimationFrame(function measure() {
      const el = contentRef.current;
      if (el) setLockedWidth(el.offsetWidth);
      else raf = requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

  // Filter out utility columns (_selection, _expand) — they shouldn't appear in settings
  const allColumns = table
    .getAllLeafColumns()
    .filter(col => col.id !== TABLE_SELECT_COLUMN_ID && col.id !== TABLE_EXPAND_COLUMN_ID);

  const filteredColumns = useMemo(() => {
    if (!search) return allColumns;
    const lower = search.toLowerCase();
    return allColumns.filter(col => {
      const header = typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id;
      return header.toLowerCase().includes(lower);
    });
  }, [allColumns, search]);

  // Labeled sections (opt-in via `columnGroups`): flat, non-reorderable list
  // grouped under headers — the FilterInput field-menu pattern. Columns absent
  // from every group fall into a trailing headerless section; groups left empty
  // by the search filter render nothing.
  const labeledSections = useMemo(() => {
    if (!columnGroups) return null;
    const byId = new Map(filteredColumns.map(col => [col.id, col]));
    const claimed = new Set<string>();
    const sections = columnGroups
      .map(group => {
        const cols = group.columns
          .map(id => byId.get(id))
          .filter((col): col is (typeof filteredColumns)[number] => col != null);
        for (const col of cols) claimed.add(col.id);
        return { label: group.label, cols };
      })
      .filter(section => section.cols.length > 0);
    const ungrouped = filteredColumns.filter(col => !claimed.has(col.id));
    return { sections, ungrouped };
  }, [columnGroups, filteredColumns]);

  // Split into pinned (including master) and unpinned groups
  const { pinnedColumns, unpinnedColumns } = useMemo(() => {
    const pinned: typeof filteredColumns = [];
    const unpinned: typeof filteredColumns = [];
    for (const col of filteredColumns) {
      if (col.getIsPinned()) {
        pinned.push(col);
      } else {
        unpinned.push(col);
      }
    }
    return { pinnedColumns: pinned, unpinnedColumns: unpinned };
  }, [filteredColumns]);

  // Override map: collect consumer-supplied sub-component overrides from children
  const { searchOverride, resetOverride, itemOverrides } = useMemo(() => {
    const [search] = collectDirectChildren(children, TableSettingsMenuSearch);
    const [reset] = collectDirectChildren(children, TableSettingsMenuReset);
    const items = new Map(
      collectDirectChildren(children, TableSettingsMenuItem).map(el => [
        (el.props as { columnId: string }).columnId,
        el,
      ]),
    );
    return { searchOverride: search, resetOverride: reset, itemOverrides: items };
  }, [children]);

  // Show separator only when there are user-pinned columns beyond master
  const hasUserPinned = pinnedColumns.some(col => col.id !== masterColumnId);

  // Render a column row, preferring a consumer-supplied override for that id.
  const renderColumnItem = (col: (typeof pinnedColumns)[number]) => {
    const override = itemOverrides.get(col.id);
    return override ? (
      cloneElement(override, { key: col.id })
    ) : (
      <TableSettingsMenuItem key={col.id} columnId={col.id} />
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const columnOrderAtom = table.atoms.columnOrder.get();
    const currentOrder = columnOrderAtom.length ? columnOrderAtom : allColumns.map(c => c.id);

    const oldIndex = currentOrder.indexOf(String(active.id));
    const newIndex = currentOrder.indexOf(String(over.id));
    const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
    ctx.setColumnOrder(newOrder);
  };

  const content = (
    <TableSettingsMenuContentProvider value={{ search, setSearch }}>
      <div
        data-testid={testId}
        className={cn(
          'absolute top-0 right-0 z-30',
          'flex items-start',
          'bg-bg-light-primary border rounded-tr-12 border-border-primary-light',
          'pl-6 pr-4 py-4',
          'rounded-tr-12',
        )}
        style={{
          height: hasTextDescription ? HEADER_HEIGHT_WITH_DESCRIPTION : DEFAULT_HEADER_HEIGHT,
        }}
      >
        <Tooltip disabled={menuOpen}>
          <TooltipTrigger asChild>
            <span className='inline-flex'>
              <DropdownMenu onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    color='neutral'
                    size='small'
                    className='shadow-sm'
                    aria-label='Table settings'
                    {...rest}
                  >
                    <Settings />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  ref={contentRef}
                  className={cn('min-w-256')}
                  // Cap at 430px but never exceed the room Ark left on the
                  // chosen side (--available-height). A bare `max-h-[430px]`
                  // overrides that var, so a menu flipped up (trigger low on a
                  // long page) kept its full height and ran off the top of the
                  // viewport; clamping to the min lets it flip either way and
                  // scroll within the space it actually has.
                  style={{ maxHeight: 'min(430px, var(--available-height))', width: lockedWidth }}
                >
                  {searchOverride ?? <TableSettingsMenuSearch />}
                  <VStack gap={1}>
                    {labeledSections ? (
                      <>
                        {labeledSections.sections.map(section => (
                          // Per-section wrapper bounds the sticky header: the
                          // group's label pins to the top while its rows scroll,
                          // then the next group's header pushes it out.
                          <div key={section.label} className='flex flex-col gap-1'>
                            <DropdownMenuLabel sticky>{section.label}</DropdownMenuLabel>
                            {section.cols.map(renderColumnItem)}
                          </div>
                        ))}
                        {labeledSections.ungrouped.map(renderColumnItem)}
                      </>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={filteredColumns
                            .filter(c => !alwaysPinnedLeft.includes(c.id))
                            .map(c => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {hasUserPinned && <DropdownMenuLabel>Pinned</DropdownMenuLabel>}

                          {pinnedColumns.map(renderColumnItem)}

                          {hasUserPinned && unpinnedColumns.length > 0 && <Separator spacing={4} />}

                          {unpinnedColumns.map(renderColumnItem)}
                        </SortableContext>
                      </DndContext>
                    )}
                  </VStack>
                  <DropdownMenuFooter>
                    {resetOverride ?? <TableSettingsMenuReset />}
                  </DropdownMenuFooter>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </TooltipTrigger>
          <TooltipContent>Table settings</TooltipContent>
        </Tooltip>
      </div>
    </TableSettingsMenuContentProvider>
  );

  if (!anchorNode) return null;

  return createPortal(content, anchorNode);
};

TableSettingsMenu.displayName = 'TableSettingsMenu';

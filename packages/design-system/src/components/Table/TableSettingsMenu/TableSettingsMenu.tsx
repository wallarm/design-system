import {
  type ButtonHTMLAttributes,
  cloneElement,
  type FC,
  type ReactNode,
  type Ref,
  useMemo,
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
  const { table, alwaysPinnedLeft, masterColumnId } = ctx;

  const hasTextDescription = table
    .getAllLeafColumns()
    .some(col => col.columnDef.meta?.description?.type === 'text');

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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

    const currentOrder = table.getState().columnOrder.length
      ? table.getState().columnOrder
      : allColumns.map(c => c.id);

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
              <DropdownMenu onOpenChange={setMenuOpen}>
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

                <DropdownMenuContent className={cn('min-w-256 max-h-[430px]')}>
                  {searchOverride ?? <TableSettingsMenuSearch />}
                  <VStack gap={1}>
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

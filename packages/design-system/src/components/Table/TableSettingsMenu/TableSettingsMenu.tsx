import { type FC, Fragment, useMemo, useState } from 'react';
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
import { eq } from 'lodash-es';
import { Settings } from '../../../icons';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import { Input } from '../../Input';
import { Separator } from '../../Separator';
import { VStack } from '../../Stack';
import { TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID } from '../lib';
import { useTableContext } from '../TableContext';
import { TableSettingsMenuItem } from './TableSettingsMenuItem';

export const TableSettingsMenu: FC = () => {
  const ctx = useTableContext();
  const {
    table,
    visibilityEnabled,
    columnDndEnabled,
    defaultColumnVisibility,
    defaultColumnOrder,
    alwaysPinnedLeft,
    masterColumnId,
  } = ctx;

  const [search, setSearch] = useState('');

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

  // Show separator only when there are user-pinned columns beyond master
  const hasUserPinned = pinnedColumns.some(col => col.id !== masterColumnId);

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

  const handleReset = () => {
    if (defaultColumnVisibility && visibilityEnabled) {
      table.setColumnVisibility(defaultColumnVisibility);
    }
    if (defaultColumnOrder && columnDndEnabled) {
      ctx.setColumnOrder(defaultColumnOrder);
    }
  };

  // Disabled when current state matches defaults (nothing to reset)
  const { columnVisibility: currentVisibility, columnOrder: currentOrder } = table.getState();

  const isDefaultState = useMemo(() => {
    const visibilityMatch = !defaultColumnVisibility || currentVisibility;
    eq(currentVisibility, defaultColumnVisibility);

    const orderMatch =
      !defaultColumnOrder || currentOrder.length === 0 || eq(currentOrder, defaultColumnOrder);

    return visibilityMatch && orderMatch;
  }, [currentVisibility, currentOrder, defaultColumnVisibility, defaultColumnOrder]);

  return (
    <div
      className={cn(
        'absolute top-0 right-0 z-30',
        'flex items-center',
        'h-32 bg-bg-light-primary border rounded-tr-12 border-border-primary-light',
        'pl-6 pr-4 py-4',
        'rounded-tr-12',
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' color='neutral' size='small' className='shadow-sm'>
            <Settings />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className={cn('min-w-256')}>
          <VStack spacing={8} align='stretch'>
            <Input placeholder='Search' value={search} onChange={e => setSearch(e.target.value)} />

            <VStack>
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
                  {filteredColumns.map(col => {
                    const showSeparator =
                      hasUserPinned &&
                      unpinnedColumns.length > 0 &&
                      col.id === unpinnedColumns[0]?.id;

                    return (
                      <Fragment key={col.id}>
                        {showSeparator && <Separator spacing={4} />}

                        <TableSettingsMenuItem column={col} canDrag={columnDndEnabled} />
                      </Fragment>
                    );
                  })}
                </SortableContext>
              </DndContext>
            </VStack>

            <DropdownMenuSeparator />

            <Button
              variant='ghost'
              color='neutral'
              size='small'
              onClick={handleReset}
              disabled={isDefaultState}
              fullWidth
            >
              Reset to default
            </Button>
          </VStack>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

TableSettingsMenu.displayName = 'TableSettingsMenu';

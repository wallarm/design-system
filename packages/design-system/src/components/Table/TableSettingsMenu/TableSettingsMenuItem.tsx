import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column } from '@tanstack/react-table';
import { GripVertical } from '../../../icons';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Switch, SwitchControl, SwitchLabel } from '../../Switch';
import { useTableContext } from '../TableContext';

interface TableSettingsMenuItemProps<T> {
  column: Column<T, unknown>;
  canDrag: boolean;
}

export const TableSettingsMenuItem = <T,>({ column, canDrag }: TableSettingsMenuItemProps<T>) => {
  const { masterColumnId } = useTableContext();
  const testId = useTestId('settings-menu-item');

  const isVisible = column.getIsVisible();
  const canHide = column.getCanHide();
  const header = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;

  const isMasterColumn = column.id === masterColumnId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: isMasterColumn || !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={testId}
      className={cn(
        'relative flex items-center w-full rounded-6 pl-20 pr-8 py-6',
        'hover:bg-states-primary-hover transition-colors',
        'data-disabled:opacity-50 data-disabled:pointer-events-none',
      )}
      data-disabled={isMasterColumn || undefined}
    >
      <span
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-icon-secondary hover:text-icon-primary data-disabled:opacity-50 data-disabled:pointer-events-none',
        )}
        {...attributes}
        {...listeners}
        data-disabled={isMasterColumn || !canDrag || undefined}
      >
        <GripVertical size='sm' />
      </span>

      <Switch
        className={cn('flex-1')}
        checked={isVisible}
        onCheckedChange={details => column.toggleVisibility(details.checked)}
        disabled={isMasterColumn || !canHide}
      >
        <SwitchLabel className={cn('flex-1 truncate')}>{header}</SwitchLabel>

        <SwitchControl />
      </Switch>
    </div>
  );
};

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from '../../../icons';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Switch, SwitchControl, SwitchLabel, type SwitchProps } from '../../Switch';
import { useTableContext } from '../TableContext';

export interface TableSettingsMenuItemProps
  extends Omit<SwitchProps, 'checked' | 'onCheckedChange' | 'disabled' | 'children'> {
  /** Column id from the table's column definitions. */
  columnId: string;
}

export const TableSettingsMenuItem = ({
  columnId,
  className,
  'data-testid': testIdProp,
  ...rest
}: TableSettingsMenuItemProps) => {
  const { masterColumnId, columnDndEnabled, table } = useTableContext();
  const slotTestId = useTestId('settings-menu-item');
  const switchTestId = useTestId(`settings-menu-item-${columnId}`, testIdProp);

  const column = table.getColumn(columnId);

  const isMasterColumn = column?.id === masterColumnId;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnId,
    disabled: isMasterColumn || !columnDndEnabled,
  });

  // Guard against a consumer-supplied override that targets a non-existent column.
  if (!column) return null;

  const isVisible = column.getIsVisible();
  const canHide = column.getCanHide();
  const header = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={slotTestId}
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
        data-disabled={isMasterColumn || !columnDndEnabled || undefined}
      >
        <GripVertical size='sm' />
      </span>

      <Switch
        {...rest}
        data-testid={switchTestId}
        className={cn('flex-1', className)}
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

TableSettingsMenuItem.displayName = 'TableSettingsMenuItem';

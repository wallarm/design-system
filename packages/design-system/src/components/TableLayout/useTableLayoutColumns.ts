import { useCallback, useMemo } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { computeColumnLayout } from './lib/computeColumnLayout';
import type {
  TableLayoutColumnController,
  TableLayoutColumnDef,
  TableLayoutColumnPinningState,
  TableLayoutColumnRenderProps,
  TableLayoutColumnResizeMode,
  TableLayoutColumnSizingState,
  TableLayoutColumnVisibilityState,
} from './types';

export interface UseTableLayoutColumnsOptions {
  columnSizing?: TableLayoutColumnSizingState;
  onColumnSizingChange?: (next: TableLayoutColumnSizingState) => void;
  columnVisibility?: TableLayoutColumnVisibilityState;
  onColumnVisibilityChange?: (next: TableLayoutColumnVisibilityState) => void;
  columnPinning?: TableLayoutColumnPinningState;
  onColumnPinningChange?: (next: TableLayoutColumnPinningState) => void;
  columnResizeMode?: TableLayoutColumnResizeMode;
}

const toRenderProps = (def: TableLayoutColumnDef): TableLayoutColumnRenderProps => ({
  columnId: def.columnId,
  align: def.align,
  pin: def.pin,
  width: def.width,
  minWidth: def.minWidth,
  maxWidth: def.maxWidth,
  resizable: def.resizable,
});

export const useTableLayoutColumns = (
  defs: TableLayoutColumnDef[],
  options: UseTableLayoutColumnsOptions = {},
): { columns: TableLayoutColumnRenderProps[]; controller: TableLayoutColumnController } => {
  const {
    columnSizing,
    onColumnSizingChange,
    columnVisibility,
    columnPinning,
    columnResizeMode = 'onEnd',
  } = options;

  const [sizing, setSizing] = useControlled<TableLayoutColumnSizingState>({
    controlled: columnSizing,
    default: {},
  });
  const [visibility] = useControlled<TableLayoutColumnVisibilityState>({
    controlled: columnVisibility,
    default: {},
  });

  const { resolved, order } = useMemo(
    () => computeColumnLayout(defs, { sizing, visibility, pinning: columnPinning }),
    [defs, sizing, visibility, columnPinning],
  );

  const setColumnSize = useCallback(
    (columnId: string, width: number) => {
      const next = { ...(sizing ?? {}), [columnId]: width };
      setSizing(next);
      onColumnSizingChange?.(next);
    },
    [sizing, setSizing, onColumnSizingChange],
  );

  const defById = useMemo(() => new Map(defs.map(d => [d.columnId, d])), [defs]);
  const columns = useMemo(
    () => order.map(id => toRenderProps(defById.get(id) as TableLayoutColumnDef)),
    [order, defById],
  );

  const controller = useMemo<TableLayoutColumnController>(
    () => ({ resolved, resizeMode: columnResizeMode, setColumnSize }),
    [resolved, columnResizeMode, setColumnSize],
  );

  return { columns, controller };
};

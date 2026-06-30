import type { CSSProperties } from 'react';

/** Cell text alignment, declared on a column and inherited by its cells. */
export type TableLayoutColumnAlign = 'left' | 'center' | 'right';

/** Column pin side (sticky offset wired up by the column-engine plan). */
export type TableLayoutColumnPin = 'left' | 'right';

export type TableLayoutColumnResizeMode = 'onChange' | 'onEnd';
export type TableLayoutColumnSizingState = Record<string, number>;
export type TableLayoutColumnVisibilityState = Record<string, boolean>;
export interface TableLayoutColumnPinningState {
  left?: string[];
  right?: string[];
}

/** Declared column definition — props of `TableLayoutColumn` and entries to `useTableLayoutColumns`. */
export interface TableLayoutColumnDef {
  columnId: string;
  align?: TableLayoutColumnAlign;
  pin?: TableLayoutColumnPin;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  hidden?: boolean;
}

/** Resolved per-column presentation stored in the registry / carried by the controller. */
export interface TableLayoutColumnResolved {
  align?: TableLayoutColumnAlign;
  hidden: boolean;
  resizable: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  pin?: TableLayoutColumnPin;
  /** Sticky positioning for a pinned cell; `{}` when not pinned. */
  stickyStyle: CSSProperties;
  lastPinnedLeft: boolean;
  firstPinnedRight: boolean;
}

/** Per-column render descriptor returned by the hook to spread onto `TableLayoutColumn`. */
export interface TableLayoutColumnRenderProps {
  columnId: string;
  align?: TableLayoutColumnAlign;
  pin?: TableLayoutColumnPin;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
}

/** Engine controller handed to `<TableLayout controller={...}>`. */
export interface TableLayoutColumnController {
  resolved: Record<string, TableLayoutColumnResolved>;
  resizeMode: TableLayoutColumnResizeMode;
  setColumnSize: (columnId: string, width: number) => void;
}

/** @deprecated Use TableLayoutColumnResolved. Kept so Layer-1 imports resolve. */
export type TableLayoutColumnPresentation = TableLayoutColumnResolved;

/** Options for the imperative `scrollToRow` method. */
export interface TableLayoutScrollToRowOptions {
  /** Alignment within the viewport. Default: 'auto'. */
  align?: 'start' | 'center' | 'end' | 'auto';
  /** Scroll behavior. Default: 'auto'. */
  behavior?: 'auto' | 'smooth';
}

/** Imperative handle exposed via `ref` on `<TableLayout>`. */
export interface TableLayoutHandle {
  /**
   * Scrolls to the row with the given id. Returns `true` if a matching
   * `[data-row-id]` row is currently mounted and a scroll was initiated,
   * `false` otherwise. Best-effort: the caller owns retry/pagination.
   */
  scrollToRow(id: string, opts?: TableLayoutScrollToRowOptions): boolean;
}

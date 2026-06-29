/** Cell text alignment, declared on a column and inherited by its cells. */
export type TableLayoutColumnAlign = 'left' | 'center' | 'right';

/** Column pin side (sticky offset wired up by the column-engine plan). */
export type TableLayoutColumnPin = 'left' | 'right';

/** Presentation a `TableLayoutColumn` registers and a `TableLayoutCell` inherits by `columnId`. */
export interface TableLayoutColumnPresentation {
  align?: TableLayoutColumnAlign;
  pin?: TableLayoutColumnPin;
  width?: number;
}

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

import type { CSSProperties } from 'react';
import type {
  TableLayoutColumnDef,
  TableLayoutColumnPin,
  TableLayoutColumnPinningState,
  TableLayoutColumnResolved,
  TableLayoutColumnSizingState,
  TableLayoutColumnVisibilityState,
} from '../types';

interface ColumnLayoutState {
  sizing?: TableLayoutColumnSizingState;
  visibility?: TableLayoutColumnVisibilityState;
  pinning?: TableLayoutColumnPinningState;
}

export const computeColumnLayout = (
  defs: TableLayoutColumnDef[],
  state: ColumnLayoutState = {},
): { resolved: Record<string, TableLayoutColumnResolved>; order: string[] } => {
  const { sizing = {}, visibility = {}, pinning } = state;

  const pinOf = (def: TableLayoutColumnDef): TableLayoutColumnPin | undefined => {
    if (pinning?.left?.includes(def.columnId)) return 'left';
    if (pinning?.right?.includes(def.columnId)) return 'right';
    return def.pin;
  };
  const hiddenOf = (def: TableLayoutColumnDef): boolean =>
    def.columnId in visibility ? !visibility[def.columnId] : !!def.hidden;
  const widthOf = (def: TableLayoutColumnDef): number | undefined =>
    sizing[def.columnId] ?? def.width;

  const resolved: Record<string, TableLayoutColumnResolved> = {};
  const base = (def: TableLayoutColumnDef, extra: Partial<TableLayoutColumnResolved>) => ({
    align: def.align,
    hidden: false,
    resizable: !!def.resizable,
    width: widthOf(def),
    minWidth: def.minWidth,
    maxWidth: def.maxWidth,
    pin: undefined,
    stickyStyle: {} as CSSProperties,
    lastPinnedLeft: false,
    firstPinnedRight: false,
    ...extra,
  });

  const visible = defs.filter(d => !hiddenOf(d));
  const leftPinned = visible.filter(d => pinOf(d) === 'left');
  const rightPinned = visible.filter(d => pinOf(d) === 'right');
  const lastLeftId = leftPinned.at(-1)?.columnId;
  const firstRightId = rightPinned[0]?.columnId;

  const rightOffset: Record<string, number> = {};
  let rightAcc = 0;
  for (let i = rightPinned.length - 1; i >= 0; i--) {
    const def = rightPinned[i];
    rightOffset[def.columnId] = rightAcc;
    rightAcc += widthOf(def) ?? 0;
  }

  let leftAcc = 0;
  for (const def of visible) {
    const pin = pinOf(def);
    let stickyStyle: CSSProperties = {};
    if (pin === 'left') {
      stickyStyle = { position: 'sticky', left: `${leftAcc}px` };
      leftAcc += widthOf(def) ?? 0;
    } else if (pin === 'right') {
      stickyStyle = { position: 'sticky', right: `${rightOffset[def.columnId]}px` };
    }
    resolved[def.columnId] = base(def, {
      pin,
      stickyStyle,
      lastPinnedLeft: def.columnId === lastLeftId,
      firstPinnedRight: def.columnId === firstRightId,
    });
  }

  for (const def of defs) {
    if (hiddenOf(def)) resolved[def.columnId] = base(def, { hidden: true });
  }

  return { resolved, order: visible.map(d => d.columnId) };
};

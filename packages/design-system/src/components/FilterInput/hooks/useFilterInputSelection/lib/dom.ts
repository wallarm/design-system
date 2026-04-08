import { CHIP_ID_PREFIX } from './constants';

const DRAG_ATTR = 'data-drag-selected';

// ── Helpers ──────────────────────────────────────────────────

export const clearDragAttributes = (chips: Map<string, HTMLElement>) => {
  [...chips.values()].forEach(chip => chip.removeAttribute(DRAG_ATTR));
};

export const hasDragSelection = (chips: Map<string, HTMLElement>): boolean =>
  [...chips.values()].some(chip => chip.hasAttribute(DRAG_ATTR));

/** Get condition indices of drag-selected chips (chip-0, chip-2 → [0, 2]) */
export const getSelectedConditionIndices = (chips: Map<string, HTMLElement>): number[] =>
  [...chips.entries()]
    .filter(([id, el]) => id.startsWith(CHIP_ID_PREFIX) && el.hasAttribute(DRAG_ATTR))
    .map(([id]) => Number(id.slice(CHIP_ID_PREFIX.length)))
    .filter(index => !Number.isNaN(index))
    .sort((a, b) => a - b);

// ── Visual sorting ───────────────────────────────────────────

interface VisualEntry {
  id: string;
  el: HTMLElement;
  rect: DOMRect;
  /** Index in the full sorted array (preserved through condition filtering) */
  allIdx: number;
}

/** Snapshot registry entries with cached rects, sorted by visual position (top→bottom, left→right) */
export const getVisualEntries = (registry: Map<string, HTMLElement>): VisualEntry[] =>
  [...registry.entries()]
    .map(([id, el]) => ({ id, el, rect: el.getBoundingClientRect(), allIdx: 0 }))
    .sort((a, b) => {
      const rowDiff = a.rect.top - b.rect.top;
      if (Math.abs(rowDiff) > Math.min(a.rect.height, b.rect.height) / 2) return rowDiff;
      return a.rect.left - b.rect.left;
    })
    .map((entry, i) => ({ ...entry, allIdx: i }));

/** Find the closest chip by clamped distance (used for anchor resolution) */
const findClosestByDistance = (entries: VisualEntry[], x: number, y: number): number =>
  entries.reduce(
    (best, entry, i) => {
      const r = entry.rect;
      const dx = Math.max(r.left - x, 0, x - r.right);
      const dy = Math.max(r.top - y, 0, y - r.bottom);
      const dist = dx * dx + dy * dy;
      return dist < best.dist ? { idx: i, dist } : best;
    },
    { idx: -1, dist: Number.POSITIVE_INFINITY },
  ).idx;

/**
 * Find the chip under or just before the cursor in reading order (left→right, top→bottom).
 * A chip is "before" the cursor if its row center is above the cursor, or it's on the same
 * row with its center ≤ cursor X. Falls back to closest-by-distance when cursor is before all chips.
 */
const findByReadingOrder = (entries: VisualEntry[], x: number, y: number): number => {
  if (entries.length === 0) return -1;

  // First check for exact hit (cursor inside a chip rect)
  const exactIdx = entries.findIndex(
    e => x >= e.rect.left && x <= e.rect.right && y >= e.rect.top && y <= e.rect.bottom,
  );
  if (exactIdx !== -1) return exactIdx;

  // Find the last chip whose row is above the cursor, or same row with center left of cursor
  const chipHeight = entries[0]!.rect.height;
  const lastBefore = entries.reduce((best, entry, i) => {
    const cy = (entry.rect.top + entry.rect.bottom) / 2;
    const cx = (entry.rect.left + entry.rect.right) / 2;
    const rowAbove = cy + chipHeight / 2 < y;
    const sameRow = !rowAbove && Math.abs(cy - y) <= chipHeight;
    if (rowAbove || (sameRow && cx <= x)) return i;
    return best;
  }, -1);

  return lastBefore >= 0 ? lastBefore : findClosestByDistance(entries, x, y);
};

// ── Anchor resolution ────────────────────────────────────────

/** Resolve the condition chip ID at the mousedown point (called once per drag). */
export const resolveAnchorChipId = (
  registry: Map<string, HTMLElement>,
  target: HTMLElement,
  x: number,
  y: number,
): string | null => {
  // Prefer exact DOM hit: walk up from target to find a registered condition chip
  const hit = [...registry.entries()].find(
    ([id, el]) => id.startsWith(CHIP_ID_PREFIX) && el.contains(target),
  );
  if (hit) return hit[0];

  // Fallback: find closest condition chip by visual distance
  const conditions = getVisualEntries(registry).filter(e => e.id.startsWith(CHIP_ID_PREFIX));
  if (conditions.length === 0) return null;
  const idx = findClosestByDistance(conditions, x, y);
  return idx >= 0 ? conditions[idx]!.id : null;
};

// ── Drag selection ───────────────────────────────────────────

/**
 * Mark chips as drag-selected from a fixed anchor chip to the current cursor position.
 * Both anchor and end are resolved in the same visually-sorted array so indices always match.
 * Connectors between selected condition chips are included automatically.
 */
export const updateDragSelection = (
  all: VisualEntry[],
  anchorChipId: string,
  currentX: number,
  currentY: number,
): boolean => {
  if (all.length === 0) return false;

  const conditions = all.filter(e => e.id.startsWith(CHIP_ID_PREFIX));
  if (conditions.length === 0) return false;

  const anchorIdx = conditions.findIndex(e => e.id === anchorChipId);
  if (anchorIdx === -1) return false;

  const endIdx = findByReadingOrder(conditions, currentX, currentY);
  if (endIdx === -1) return false;

  const minIdx = Math.min(anchorIdx, endIdx);
  const maxIdx = Math.max(anchorIdx, endIdx);

  const firstAll = conditions[minIdx]!.allIdx;
  const lastAll = conditions[maxIdx]!.allIdx;

  let found = false;
  all.forEach((entry, i) => {
    const inRange = i >= firstAll && i <= lastAll;
    if (inRange) {
      entry.el.setAttribute(DRAG_ATTR, '');
      found = true;
    } else {
      entry.el.removeAttribute(DRAG_ATTR);
    }
  });
  return found;
};

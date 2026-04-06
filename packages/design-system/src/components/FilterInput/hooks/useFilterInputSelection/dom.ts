import { CHIP_ID_PREFIX } from './constants';

const DRAG_ATTR = 'data-drag-selected';

export const isChipInRange = (chip: HTMLElement, x1: number, x2: number): boolean => {
  const rect = chip.getBoundingClientRect();
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return rect.left <= maxX && rect.right >= minX;
};

export const clearDragAttributes = (chips: Map<string, HTMLElement>) => {
  for (const chip of chips.values()) {
    chip.removeAttribute(DRAG_ATTR);
  }
};

export const hasDragSelection = (chips: Map<string, HTMLElement>): boolean => {
  for (const chip of chips.values()) {
    if (chip.hasAttribute(DRAG_ATTR)) return true;
  }
  return false;
};

/** Get condition indices of drag-selected chips (chip-0, chip-2 → [0, 2]) */
export const getSelectedConditionIndices = (chips: Map<string, HTMLElement>): number[] => {
  const indices: number[] = [];
  for (const [id, el] of chips.entries()) {
    if (!id.startsWith(CHIP_ID_PREFIX)) continue;
    if (!el.hasAttribute(DRAG_ATTR)) continue;
    const index = Number(id.slice(CHIP_ID_PREFIX.length));
    if (!Number.isNaN(index)) indices.push(index);
  }
  return indices.sort((a, b) => a - b);
};

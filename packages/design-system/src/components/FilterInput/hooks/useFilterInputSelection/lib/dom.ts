import { CHIP_ID_PREFIX } from './constants';

const DRAG_ATTR = 'data-drag-selected';

const isChipInRange = (chip: HTMLElement, x1: number, x2: number): boolean => {
  const rect = chip.getBoundingClientRect();
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return rect.left <= maxX && rect.right >= minX;
};

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

/** Mark chips as drag-selected based on horizontal range. Returns true if any chip was selected. */
export const updateDragSelection = (
  registry: Map<string, HTMLElement>,
  startX: number,
  currentX: number,
): boolean =>
  [...registry.values()].reduce((found, chip) => {
    const inRange = isChipInRange(chip, startX, currentX);
    if (inRange) chip.setAttribute(DRAG_ATTR, '');
    else chip.removeAttribute(DRAG_ATTR);
    return found || inRange;
  }, false);

/** Check if every condition chip in the registry is drag-selected */
export const areAllConditionsDragged = (registry: Map<string, HTMLElement>): boolean => {
  const conditions = [...registry.entries()].filter(([id]) => id.startsWith(CHIP_ID_PREFIX));
  return conditions.length > 0 && conditions.every(([, el]) => el.hasAttribute(DRAG_ATTR));
};

export const isChipInRange = (chip: HTMLElement, x1: number, x2: number): boolean => {
  const rect = chip.getBoundingClientRect();
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return rect.left <= maxX && rect.right >= minX;
};

export const clearDragAttributes = (chips: Map<string, HTMLElement>) => {
  for (const chip of chips.values()) {
    chip.removeAttribute('data-drag-selected');
  }
};

export const hasDragSelection = (chips: Map<string, HTMLElement>): boolean => {
  for (const chip of chips.values()) {
    if (chip.hasAttribute('data-drag-selected')) return true;
  }
  return false;
};

/** Get condition indices of drag-selected chips (chip-0, chip-2 → [0, 2]) */
export const getSelectedConditionIndices = (chips: Map<string, HTMLElement>): number[] => {
  const indices: number[] = [];
  for (const [id, el] of chips.entries()) {
    if (!id.startsWith('chip-')) continue;
    if (!el.hasAttribute('data-drag-selected')) continue;
    const index = Number(id.slice(5));
    if (!Number.isNaN(index)) indices.push(index);
  }
  return indices.sort((a, b) => a - b);
};

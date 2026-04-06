export const isChipInRange = (chip: HTMLElement, x1: number, x2: number): boolean => {
  const rect = chip.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return center >= minX && center <= maxX;
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

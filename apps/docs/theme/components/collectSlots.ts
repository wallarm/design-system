/** Distinct `data-slot` values under `roots` (each root included), in DOM order. */
export function collectSlots(roots: Element[]): string[] {
  const slots = new Set<string>();
  for (const root of roots) {
    const nodes = root.matches('[data-slot]')
      ? [root, ...root.querySelectorAll('[data-slot]')]
      : root.querySelectorAll('[data-slot]');
    for (const node of nodes) slots.add(node.getAttribute('data-slot') ?? '');
  }
  return [...slots];
}

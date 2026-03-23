/** Walk up the offsetParent chain to get absolute offset from document top. */
export const getDocumentOffsetTop = (el: HTMLElement): number => {
  let offset = 0;
  let current: HTMLElement | null = el;
  while (current) {
    offset += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return offset;
};

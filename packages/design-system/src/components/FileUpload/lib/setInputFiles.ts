/**
 * Writes `files` into a file input the way zag does (`DataTransfer` → `input.files`), so the
 * files go with native form submission. A no-op where `DataTransfer` is missing.
 */
export const setInputFiles = (input: HTMLInputElement, files: File[]): void => {
  const win = input.ownerDocument.defaultView;
  if (!win || !('DataTransfer' in win)) return;
  try {
    const transfer = new win.DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  } catch {
    // Old browsers refuse to construct DataTransfer; the input just keeps what it had.
  }
};

/** zag's `isFileEqual`: name, size and type — not `lastModified` or content. */
export const isSameFile = (a: File, b: File): boolean =>
  a.name === b.name && a.size === b.size && a.type === b.type;

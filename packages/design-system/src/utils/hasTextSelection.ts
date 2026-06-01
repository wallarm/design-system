// True when the page has a non-empty text selection. Reads the DOM — call only
// from event handlers (e.g. to tell a selection-ending click from a plain one).
export const hasTextSelection = (): boolean => (window.getSelection()?.toString().length ?? 0) > 0;

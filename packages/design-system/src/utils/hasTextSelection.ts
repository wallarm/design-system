/**
 * Returns `true` when the user currently has a non-empty text selection on the
 * page. Useful in click handlers to distinguish a click that ends a text
 * selection (the user meant to select/copy) from an intentional click.
 *
 * Reading the selection is inherently an imperative DOM operation — call this
 * only from event handlers, never during render.
 */
export const hasTextSelection = (): boolean => (window.getSelection()?.toString().length ?? 0) > 0;

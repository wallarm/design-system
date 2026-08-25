/**
 * Position the caret when a segment enters inline-edit. The input self-describes
 * its preference via `data-caret-mode`, so every focus path (the Segment effect
 * and useFocusManagement's focus-retention rAF) applies the same rule without
 * either needing the field config.
 *
 *   - `end`  → caret at the end of the value (natural for long values: the user
 *              clicks in and keeps typing/backspacing from the tail; a further
 *              click while editing then repositions natively). AS-1064.
 *   - else   → select the whole value (default: typing replaces it).
 */
export const applyEditCaret = (input: HTMLInputElement | null): void => {
  if (!input) return;
  if (input.dataset.caretMode === 'end') {
    const end = input.value.length;
    input.setSelectionRange(end, end);
    return;
  }
  input.select();
};

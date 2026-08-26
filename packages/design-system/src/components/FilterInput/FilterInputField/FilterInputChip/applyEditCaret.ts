// Caret on inline-edit: `data-caret-mode="end"` → tail (long values), else
// select-all. Read off the attr so both focus paths (Segment effect +
// useFocusManagement rAF) share one rule without the field config. (AS-1064)
export const applyEditCaret = (input: HTMLInputElement | null): void => {
  if (!input) return;
  if (input.dataset.caretMode === 'end') {
    const end = input.value.length;
    input.setSelectionRange(end, end);
    return;
  }
  input.select();
};

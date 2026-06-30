import type { ValueOption } from './FilterInputValueMenu';

/**
 * Searchable strings for a value option: its label, its stringified value, and
 * its optional `description` (so a path fragment finds the row). Fed to
 * `filterAndSort`. The description entry is omitted when absent.
 */
export const valueOptionSearchText = (
  option: Pick<ValueOption, 'value' | 'label' | 'description'>,
): string[] => {
  const text = [option.label, String(option.value)];
  if (option.description) text.push(option.description);
  return text;
};

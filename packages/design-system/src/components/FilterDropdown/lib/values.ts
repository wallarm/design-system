import type { CollectionItem, ListCollection } from '@ark-ui/react/collection';

/**
 * Value of the single-mode «All …» option inside Ark. The consumer never sees it: it maps to `[]`.
 */
export const ALL_VALUE = '__all__';

/**
 * Prefix of the alias values that back the rows of the multi-mode "Selected" section. Ark keys
 * items by value, so a row rendered twice needs a second value; the root strips the prefix before
 * anything reaches the consumer.
 */
export const SELECTED_PREFIX = '__selected__:';

const SPECIAL = Symbol('filter-dropdown-special-item');

/** An item that exists only inside the Ark collection: the «All» sentinel or a "Selected" alias. */
export interface FilterDropdownSpecialItem<T extends CollectionItem = CollectionItem> {
  readonly [SPECIAL]: true;
  readonly value: string;
  readonly label: string;
  /** The base item an alias duplicates; absent on the «All» sentinel. */
  readonly source?: T;
}

export const isSpecialItem = (item: unknown): item is FilterDropdownSpecialItem =>
  typeof item === 'object' && item !== null && SPECIAL in item;

export const toAliasValue = (value: string): string => `${SELECTED_PREFIX}${value}`;

export const isAliasValue = (value: string): boolean => value.startsWith(SELECTED_PREFIX);

export const toBaseValue = (value: string): string =>
  isAliasValue(value) ? value.slice(SELECTED_PREFIX.length) : value;

export const createAllItem = (label: string): FilterDropdownSpecialItem => ({
  [SPECIAL]: true,
  value: ALL_VALUE,
  label,
});

export const createAliasItem = <T extends CollectionItem>(
  item: T,
  collection: ListCollection<T>,
): FilterDropdownSpecialItem<T> => ({
  [SPECIAL]: true,
  value: toAliasValue(collection.getItemValue(item) ?? ''),
  label: collection.stringifyItem(item) ?? '',
  source: item,
});

interface ToInternalValueOptions {
  multiple: boolean;
  /** Base values that currently have an alias row in the "Selected" section. */
  aliased: ReadonlySet<string>;
  /**
   * Single mode: the «All» row is in the collection. Without it an unset value stays `[]`, so Ark
   * never selects or highlights a value it cannot find.
   * @default true
   */
  hasAll?: boolean;
}

/**
 * Consumer value → the value handed to Ark.
 * - single: `[]` becomes the «All» sentinel, so «All» shows as picked;
 * - multi: every picked value that has an alias row is doubled with its alias, so the copy in
 *   "Selected" and the original in the list tick together.
 */
export const toInternalValue = (
  value: readonly string[],
  { multiple, aliased, hasAll = true }: ToInternalValueOptions,
): string[] => {
  if (!multiple) {
    const [first] = value;
    if (first === undefined) return hasAll ? [ALL_VALUE] : [];
    return [first];
  }
  return [...value, ...value.filter(v => aliased.has(v)).map(toAliasValue)];
};

interface ToConsumerValueOptions {
  multiple: boolean;
  /** The internal value Ark had before this change. */
  previousInternal: readonly string[];
  /** The consumer value before this change. */
  previousValue: readonly string[];
}

/**
 * Ark's next value → consumer value. Never returns the sentinel or an alias.
 * - single: the sentinel (or nothing) becomes `[]`;
 * - multi: Ark only ever toggles, so the change is read as a diff against what Ark had — an alias
 *   toggles its base value, which is how unticking a copy in "Selected" unticks the original.
 */
export const toConsumerValue = (
  next: readonly string[],
  { multiple, previousInternal, previousValue }: ToConsumerValueOptions,
): string[] => {
  if (!multiple) {
    const [first] = next;
    return first === undefined || first === ALL_VALUE ? [] : [toBaseValue(first)];
  }

  const before = new Set(previousInternal);
  const after = new Set(next);
  let result = [...previousValue];

  for (const v of next) {
    if (before.has(v) || v === ALL_VALUE) continue;
    const base = toBaseValue(v);
    if (!result.includes(base)) result.push(base);
  }
  for (const v of previousInternal) {
    if (after.has(v)) continue;
    const base = toBaseValue(v);
    result = result.filter(r => r !== base);
  }

  return result;
};

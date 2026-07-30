import type { ValueGroup } from '../types';

/** A render-ready value-menu section. `label` undefined = headerless. */
export interface ValueMenuSection<T> {
  label?: string;
  values: T[];
}

/** Minimal shape the bucketer needs — keeps `lib` free of the menu's option type. */
interface HasValue {
  value: string | number | boolean;
}

/**
 * Bucket already-composed dropdown options into ordered sections. The value-menu
 * counterpart of `buildFieldMenuSections`, with one deliberate difference: it
 * takes the **composed** option list (post `filterAndSort`, post label-borrowing
 * and orphan recovery from `useValueMenuDisplayValues`) rather than the raw
 * field values, so those paths keep working untouched and filtering stays in one
 * place. Orphaned selections therefore land in the trailing headerless section.
 *
 * With no `valueGroups`, returns a single headerless section (today's flat list).
 * With groups: values render under group headers in group/listed order, values
 * not claimed by any group fall into a trailing headerless section, and sections
 * with no surviving values are dropped.
 */
export function buildValueMenuSections<T extends HasValue>(
  values: T[],
  valueGroups: ValueGroup[] | undefined,
): Array<ValueMenuSection<T>> {
  if (!valueGroups || valueGroups.length === 0) {
    return values.length > 0 ? [{ values }] : [];
  }

  // Loose keying by String — consistent with the rest of the value pipeline,
  // where a parser round-trip can stringify a typed primitive (5 → "5").
  const byKey = new Map<string, T>();
  for (const option of values) {
    const key = String(option.value);
    if (!byKey.has(key)) byKey.set(key, option);
  }

  const claimed = new Set<string>();
  const sections: Array<ValueMenuSection<T>> = [];

  for (const group of valueGroups) {
    const groupValues: T[] = [];
    for (const member of group.values) {
      const key = String(member);
      if (claimed.has(key)) continue;
      const option = byKey.get(key);
      if (!option) continue;
      claimed.add(key);
      groupValues.push(option);
    }
    if (groupValues.length > 0) sections.push({ label: group.label, values: groupValues });
  }

  const ungrouped = values.filter(option => !claimed.has(String(option.value)));
  if (ungrouped.length > 0) sections.push({ values: ungrouped });

  return sections;
}

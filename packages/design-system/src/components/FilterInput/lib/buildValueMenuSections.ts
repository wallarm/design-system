import type { FieldValueOption } from '../types';
import { collectLeaves, isValueGroup } from './fields';
import { filterAndSort } from './filterSort';

/**
 * A single navigable row in the value menu. `isGroup` rows are presentational
 * parent categories that open a submenu of their `option.children`; leaf rows
 * carry a committable `option.value`.
 */
export interface ValueMenuRow {
  /** Stable id for keyboard-nav + DOM registry (unique within its level). */
  id: string;
  option: FieldValueOption;
  isGroup: boolean;
}

/** A render-ready value-menu section. `label` undefined = headerless. */
export interface ValueMenuSection {
  label?: string;
  rows: ValueMenuRow[];
}

/**
 * Searchable strings for a row: its own label/value/description plus every
 * descendant leaf's label/value — so a parent category stays visible when the
 * query matches one of its (currently hidden) sub-values.
 */
const rowSearchText = (option: FieldValueOption): string[] => {
  const text = [option.label, String(option.value ?? '')];
  if (option.description) text.push(option.description);
  for (const leaf of collectLeaves(option.children)) {
    text.push(leaf.label, String(leaf.value ?? ''));
  }
  return text;
};

const rowId = (option: FieldValueOption): string =>
  isValueGroup(option) ? `group:${option.label}` : `leaf:${String(option.value)}`;

const toRows = (options: FieldValueOption[], filterText: string): ValueMenuRow[] =>
  filterAndSort(options, filterText, rowSearchText).map(option => ({
    id: rowId(option),
    option,
    isGroup: isValueGroup(option),
  }));

/**
 * Bucket value options into ordered, filtered menu sections.
 *
 * Three shapes, in priority order:
 * 1. **Top-level groups** — each top-level group node becomes a section (its
 *    `label` is the header, its `children` are the rows); any top-level leaves
 *    fall into a leading headerless section.
 * 2. **`section` field sugar** — leaves tagged with `section` are bucketed under
 *    that header in first-appearance order; untagged leaves lead headerless.
 * 3. **Flat** — no grouping: a single headerless section (today's behavior, so
 *    existing fields are visually unchanged).
 *
 * Each section is filtered by `filterText`; sections with no surviving rows are
 * dropped. A group row survives if its label OR any descendant leaf matches.
 */
export function buildValueMenuSections(
  values: FieldValueOption[],
  filterText: string,
): ValueMenuSection[] {
  const topGroups = values.filter(isValueGroup);

  // 1. Top-level groups → sections.
  if (topGroups.length > 0) {
    const sections: ValueMenuSection[] = [];
    const topLeaves = values.filter(v => !isValueGroup(v));
    const leafRows = toRows(topLeaves, filterText);
    if (leafRows.length > 0) sections.push({ rows: leafRows });
    for (const group of topGroups) {
      const rows = toRows(group.children ?? [], filterText);
      if (rows.length > 0) sections.push({ label: group.label, rows });
    }
    return sections;
  }

  // 2. `section` field sugar.
  if (values.some(v => v.section)) {
    const order: string[] = [];
    const buckets = new Map<string, FieldValueOption[]>();
    const unsectioned: FieldValueOption[] = [];
    for (const option of values) {
      if (option.section) {
        if (!buckets.has(option.section)) {
          buckets.set(option.section, []);
          order.push(option.section);
        }
        buckets.get(option.section)!.push(option);
      } else {
        unsectioned.push(option);
      }
    }
    const sections: ValueMenuSection[] = [];
    const unsectionedRows = toRows(unsectioned, filterText);
    if (unsectionedRows.length > 0) sections.push({ rows: unsectionedRows });
    for (const label of order) {
      const rows = toRows(buckets.get(label)!, filterText);
      if (rows.length > 0) sections.push({ label, rows });
    }
    return sections;
  }

  // 3. Flat.
  const rows = toRows(values, filterText);
  return rows.length > 0 ? [{ rows }] : [];
}

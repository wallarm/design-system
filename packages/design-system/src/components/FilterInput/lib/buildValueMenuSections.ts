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
  /**
   * True for the synthetic **"All {group}"** bulk-select row rendered at the top
   * of a labeled section. It is a group row for check-state/toggle purposes (its
   * `option.children` are the section's full scope) but is NOT a submenu trigger:
   * it never opens a right-side panel, it only toggles its descendant leaves.
   */
  isSelectAll?: boolean;
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
 * The synthetic **"All {label}"** bulk-select row for a labeled section. Its
 * `option` is a group over `scope` (the section's *full, unfiltered* options) so
 * the shared tri-state / toggle-group logic treats it as selecting every
 * descendant leaf — mirroring the submenu's own "All {group}" row.
 */
const selectAllRow = (label: string, scope: FieldValueOption[]): ValueMenuRow => ({
  id: `select-all:${label}`,
  option: { label: `All ${label}`, children: scope },
  isGroup: true,
  isSelectAll: true,
});

/** Joins ancestry labels for a flat-search row's muted second line. */
export const PATH_SEPARATOR = ' › ';

const matchesQuery = (value: string | number | boolean | undefined, query: string): boolean =>
  value != null && String(value).toLowerCase().includes(query);

/**
 * Flatten a grouped value tree into a single flat list of matches for a search
 * query (see §4 "flattened search"). Two row kinds, in tree order:
 *
 * - **Leaf matches** — every leaf whose own label/value/description contains the
 *   query, carrying its ancestry as `description` (a muted second line) so deep
 *   matches are disambiguated.
 * - **"All {group}" shortcuts** (multi-select only) — for every group/type node
 *   whose *own* label matches, a bulk-select row scoped to that node, so typing a
 *   group name offers one-click selection of its whole subtree.
 *
 * Shortcuts lead, then leaves. Selection/tri-state persist across searching
 * because rows still carry the real leaf `value` / group scope. Submenus never
 * open here — the list is already flat.
 */
function buildFlatSearchSections(
  values: FieldValueOption[],
  query: string,
  multiSelect: boolean,
): ValueMenuSection[] {
  const shortcuts: ValueMenuRow[] = [];
  const leaves: ValueMenuRow[] = [];

  const walk = (options: FieldValueOption[], path: string[]): void => {
    for (const option of options) {
      if (isValueGroup(option)) {
        if (multiSelect && matchesQuery(option.label, query)) {
          shortcuts.push({
            id: `select-all:${[...path, option.label].join('/')}`,
            option: {
              ...option,
              label: `All ${option.label}`,
              description: path.join(PATH_SEPARATOR) || undefined,
            },
            isGroup: true,
            isSelectAll: true,
          });
        }
        walk(option.children ?? [], [...path, option.label]);
      } else if (
        matchesQuery(option.label, query) ||
        matchesQuery(option.value, query) ||
        matchesQuery(option.description, query)
      ) {
        // `section`-sugar leaves carry their bucket name instead of a tree path.
        const ancestry = path.length > 0 ? path.join(PATH_SEPARATOR) : option.section;
        leaves.push({
          id: `leaf:${String(option.value)}`,
          option: { ...option, description: ancestry || undefined },
          isGroup: false,
        });
      }
    }
  };

  walk(values, []);

  const rows = [...shortcuts, ...leaves];
  return rows.length > 0 ? [{ rows }] : [];
}

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
 * A non-empty `filterText` **flattens** a grouped tree into a single flat list
 * of matches at any depth (see {@link buildFlatSearchSections}) — hover submenus
 * are unreachable while typing, so deep values are surfaced directly with their
 * ancestry path. With an empty query the grouped structure below is returned.
 *
 * When `multiSelect` is set, every **labeled** section is prefixed with a
 * synthetic "All {label}" bulk-select row (see {@link selectAllRow}) so the user
 * can select/deselect the whole group's scope in one click; single-select menus
 * omit it (bulk selection is meaningless there).
 */
export function buildValueMenuSections(
  values: FieldValueOption[],
  filterText: string,
  multiSelect = false,
): ValueMenuSection[] {
  const query = filterText.trim().toLowerCase();
  const hasHierarchy = values.some(v => isValueGroup(v) || v.section != null);

  // Typing flattens a grouped tree into a flat match list at any depth.
  if (query.length > 0 && hasHierarchy) {
    return buildFlatSearchSections(values, query, multiSelect);
  }

  // Prefix a labeled section's rows with its "All {label}" row (multi-select
  // only). `scope` is the full unfiltered option set so "All" spans the whole
  // group even while a search narrows the visible rows.
  const withSelectAll = (
    label: string,
    scope: FieldValueOption[],
    rows: ValueMenuRow[],
  ): ValueMenuRow[] => (multiSelect ? [selectAllRow(label, scope), ...rows] : rows);

  const topGroups = values.filter(isValueGroup);

  // 1. Top-level groups → sections.
  if (topGroups.length > 0) {
    const sections: ValueMenuSection[] = [];
    const topLeaves = values.filter(v => !isValueGroup(v));
    const leafRows = toRows(topLeaves, filterText);
    if (leafRows.length > 0) sections.push({ rows: leafRows });
    for (const group of topGroups) {
      const children = group.children ?? [];
      const rows = toRows(children, filterText);
      if (rows.length > 0)
        sections.push({ label: group.label, rows: withSelectAll(group.label, children, rows) });
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
      const bucket = buckets.get(label)!;
      const rows = toRows(bucket, filterText);
      if (rows.length > 0) sections.push({ label, rows: withSelectAll(label, bucket, rows) });
    }
    return sections;
  }

  // 3. Flat.
  const rows = toRows(values, filterText);
  return rows.length > 0 ? [{ rows }] : [];
}

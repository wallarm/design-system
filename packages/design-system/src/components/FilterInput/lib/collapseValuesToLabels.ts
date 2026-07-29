import type { FieldMetadata, FieldValueOption } from '../types';
import { collectLeaves, isValueGroup } from './fields';

/**
 * A display token for a multi-value chip. A `group` token stands in for a
 * **submenu** parent category (e.g. "SQL injection"): `count` present means a
 * partial selection ("SQL injection (4)"), `count` absent means every sub-value
 * is selected ("SQL injection"). A `leaf` token is a single committed value.
 */
export type CollapseToken =
  | { kind: 'group'; label: string; count?: number }
  | { kind: 'leaf'; value: string | number | boolean };

/**
 * Collapse a committed leaf-value array into display tokens, folding a submenu
 * parent category into a single group token. Display-only: the stored
 * `Condition.value` array is never mutated and always holds leaf values.
 *
 * For a field with no nested groups this returns one leaf token per value in
 * the original committed order (identical to the previous flat behavior). For a
 * nested field it walks the config in declaration order:
 * - **Top-level groups are section headers** (no checkbox) — never collapsed;
 *   we recurse so their direct leaves render individually.
 * - **Nested groups are submenu categories** — any selection collapses to a
 *   single group token: fully selected → just the label; partially selected →
 *   label + selected-leaf `count`.
 *
 * Committed values absent from the config (freeform) trail in committed order.
 */
export const collapseValues = (
  field: FieldMetadata,
  values: Array<string | number | boolean>,
): CollapseToken[] => {
  const options = field.values;
  const hasGroups = options?.some(isValueGroup) ?? false;
  if (!options || !hasGroups) {
    return values.map(value => ({ kind: 'leaf', value }));
  }

  const committed = new Set(values.map(String));
  const consumed = new Set<string>();
  const tokens: CollapseToken[] = [];

  const walk = (opts: FieldValueOption[], depth: number): void => {
    for (const option of opts) {
      if (isValueGroup(option)) {
        // Top-level groups render as section headers, not selectable submenu
        // categories — recurse so their leaves show individually.
        if (depth === 0) {
          walk(option.children, depth + 1);
          continue;
        }
        const leafKeys = collectLeaves(option.children).map(leaf => String(leaf.value));
        const selected = leafKeys.filter(key => committed.has(key));
        if (selected.length === 0) continue;
        const isFull = selected.length === leafKeys.length;
        tokens.push(
          isFull
            ? { kind: 'group', label: option.label }
            : { kind: 'group', label: option.label, count: selected.length },
        );
        for (const key of selected) consumed.add(key);
      } else if (option.value != null) {
        const key = String(option.value);
        if (committed.has(key) && !consumed.has(key)) {
          tokens.push({ kind: 'leaf', value: option.value });
          consumed.add(key);
        }
      }
    }
  };
  walk(options, 0);

  // Freeform values not present in the config, in original committed order.
  for (const value of values) {
    const key = String(value);
    if (!consumed.has(key)) {
      tokens.push({ kind: 'leaf', value });
      consumed.add(key);
    }
  }

  return tokens;
};

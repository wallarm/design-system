import type { FieldMetadata, FieldValueOption } from '../types';
import { collectLeaves, isValueGroup } from './fields';

/**
 * A display token for a multi-value chip. A `group` token stands in for a group
 * whose every descendant leaf is selected (e.g. "SQL injection", or a whole
 * top-level section like "Input-based attacks") — it renders as just the group
 * label. A `leaf` token is a single committed value. Partial group selections
 * are never a group token: they expand to their individual `leaf` tokens.
 */
export type CollapseToken =
  | { kind: 'group'; label: string }
  | { kind: 'leaf'; value: string | number | boolean };

/**
 * Collapse a leaf-value array into display tokens, folding a **fully selected**
 * group into a single group token. Display-only: the underlying value array is
 * never mutated and always holds leaf values.
 *
 * Walks the config in declaration order:
 * - A group with **every** descendant leaf selected collapses to a single group
 *   token (its label) — this applies at any depth, so both a submenu category
 *   ("SQL injection") and a whole top-level section ("Input-based attacks")
 *   collapse the same way.
 * - A **partially** selected group is not collapsed: we recurse into it so its
 *   selected leaves render individually, while any nested fully-selected
 *   subgroup still folds to its own label.
 *
 * Values absent from the config (freeform) trail in original committed order.
 */
export const collapseValueOptions = (
  options: FieldValueOption[] | undefined,
  values: Array<string | number | boolean>,
): CollapseToken[] => {
  const hasGroups = options?.some(isValueGroup) ?? false;
  if (!options || !hasGroups) {
    return values.map(value => ({ kind: 'leaf', value }));
  }

  const committed = new Set(values.map(String));
  const consumed = new Set<string>();
  const tokens: CollapseToken[] = [];

  const walk = (opts: FieldValueOption[]): void => {
    for (const option of opts) {
      if (isValueGroup(option)) {
        const leafKeys = collectLeaves(option.children).map(leaf => String(leaf.value));
        const selected = leafKeys.filter(key => committed.has(key));
        if (selected.length === 0) continue;
        if (selected.length === leafKeys.length) {
          // Whole group selected → a single label token.
          tokens.push({ kind: 'group', label: option.label });
          for (const key of selected) consumed.add(key);
        } else {
          // Partial selection → enumerate; nested full subgroups still collapse.
          walk(option.children);
        }
      } else if (option.value != null) {
        const key = String(option.value);
        if (committed.has(key) && !consumed.has(key)) {
          tokens.push({ kind: 'leaf', value: option.value });
          consumed.add(key);
        }
      }
    }
  };
  walk(options);

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

/** {@link collapseValueOptions} keyed off a field's own value config. */
export const collapseValues = (
  field: FieldMetadata,
  values: Array<string | number | boolean>,
): CollapseToken[] => collapseValueOptions(field.values, values);

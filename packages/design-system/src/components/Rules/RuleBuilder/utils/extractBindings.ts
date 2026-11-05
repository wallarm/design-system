/**
 * Extract Bindings
 *
 * Extracts bind_attack and bind_point references from condition tree.
 * These are used to populate reference selectors in ActionEditor.
 */

import type { ConditionNode, GroupCondition } from '../types';

export interface BindingInfo {
  /** Binding ID (e.g., "a", "n", "v") */
  id: string;
  /** Binding type: attack bindings or point bindings */
  type: 'attack' | 'point';
  /** Human-readable label (e.g., "Attack 'a' from sqli condition") */
  label: string;
}

/**
 * Extract all bindings from condition tree.
 *
 * Walks the condition tree and collects all bind_attack and bind_point IDs.
 * Returns array of BindingInfo for UI selection.
 *
 * @param root - Root group condition
 * @returns Array of available bindings
 *
 * @example
 * ```typescript
 * const bindings = extractBindings(condition);
 * // [
 * //   { id: "a", type: "attack", label: "Attack 'a' from sqli" },
 * //   { id: "n", type: "point", label: "Point 'n' from regexp" }
 * // ]
 * ```
 */
export function extractBindings(root: GroupCondition): BindingInfo[] {
  const bindings: BindingInfo[] = [];

  function walk(node: ConditionNode) {
    if (node.kind === 'group') {
      // Recurse into children
      for (const child of node.children) {
        walk(child);
      }
      return;
    }

    // Extract attack bindings from attack_present conditions
    if (node.kind === 'attack' && node.bindAttack) {
      const attackTypeLabel = node.attackType || 'any attack';
      bindings.push({
        id: node.bindAttack,
        type: 'attack',
        label: `Attack '${node.bindAttack}' (${attackTypeLabel})`,
      });
    }

    // Extract point bindings from field conditions with bind_point
    if (node.kind === 'field' && node.bindPoint) {
      const conditionLabel = node.value.condition || 'field';
      bindings.push({
        id: node.bindPoint,
        type: 'point',
        label: `Point '${node.bindPoint}' (${conditionLabel})`,
      });
    }

    // Extract point bindings from signal conditions with bind_point
    if (node.kind === 'signal' && node.bindPoint) {
      const signalLabel = node.signalType || 'signal';
      bindings.push({
        id: node.bindPoint,
        type: 'point',
        label: `Point '${node.bindPoint}' (${signalLabel})`,
      });
    }
  }

  walk(root);

  return bindings;
}

/**
 * Check if action kind supports attack_ref.
 *
 * @param kind - Action kind
 * @returns True if action supports attack_ref
 */
export function supportsAttackRef(kind: string): boolean {
  return kind === 'suppress_attack' || kind === 'mark_attack';
}

/**
 * Check if action kind supports target_ref.
 *
 * @param kind - Action kind
 * @returns True if action supports target_ref
 */
export function supportsTargetRef(kind: string): boolean {
  // All actions with point target can use target_ref
  // Exclude flow-only actions
  return kind !== 'disable_rule';
}

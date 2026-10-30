/**
 * RuleBuilder Utility Helpers
 *
 * Helper functions for tree traversal, counting, and manipulation.
 */

import type { ConditionNode } from '../types';

/**
 * Check if a condition tree contains a descendant of any of the specified kinds.
 *
 * @param node - Root node to search
 * @param kinds - Array of node kinds to search for
 * @returns True if any descendant matches the kinds
 *
 * @example
 * ```typescript
 * const hasSignals = hasDescendantOfKind(condition, ['attack', 'signal']);
 * ```
 */
export function hasDescendantOfKind(node: ConditionNode, kinds: ConditionNode['kind'][]): boolean {
  if (kinds.includes(node.kind)) {
    return true;
  }

  if (node.kind === 'group') {
    return node.children.some(child => hasDescendantOfKind(child, kinds));
  }

  return false;
}

/**
 * Count the total number of checks (leaf nodes) in a condition tree.
 * Groups are not counted, only actual condition checks.
 *
 * @param node - Root node to count from
 * @returns Total number of leaf condition nodes
 *
 * @example
 * ```typescript
 * const checkCount = countChecks(condition);
 * ```
 */
export function countChecks(node: ConditionNode): number {
  if (node.kind === 'group') {
    return node.children.reduce((sum, child) => sum + countChecks(child), 0);
  }

  // Field, attack, signal, raw are all leaf nodes
  return 1;
}

/**
 * Calculate the maximum depth of a condition tree.
 * Root has depth 0, its children have depth 1, etc.
 *
 * @param node - Root node
 * @returns Maximum depth of the tree
 *
 * @example
 * ```typescript
 * const depth = maxDepth(condition);
 * ```
 */
export function maxDepth(node: ConditionNode): number {
  if (node.kind !== 'group') {
    return 0;
  }

  if (node.children.length === 0) {
    return 0;
  }

  const childDepths = node.children.map(child => maxDepth(child));
  return 1 + Math.max(...childDepths);
}

/**
 * Find a node in the tree by its ID.
 *
 * @param root - Root node to search from
 * @param targetId - ID to search for
 * @returns The found node or null
 */
export function findNodeById(root: ConditionNode, targetId: string): ConditionNode | null {
  if (root.id === targetId) {
    return root;
  }

  if (root.kind === 'group') {
    for (const child of root.children) {
      const found = findNodeById(child, targetId);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Map over all nodes in the tree, transforming each one.
 *
 * @param node - Root node
 * @param fn - Transform function
 * @returns Transformed tree
 */
export function mapNode(
  node: ConditionNode,
  fn: (node: ConditionNode) => ConditionNode,
): ConditionNode {
  const transformed = fn(node);

  if (transformed.kind === 'group') {
    return {
      ...transformed,
      children: transformed.children.map(child => mapNode(child, fn)),
    };
  }

  return transformed;
}

/**
 * Remove a node from the tree by its ID.
 * Returns the modified tree, or null if the root was removed.
 *
 * @param root - Root node
 * @param targetId - ID of node to remove
 * @returns Modified tree or null if root was removed
 */
export function removeNode(root: ConditionNode, targetId: string): ConditionNode | null {
  if (root.id === targetId) {
    return null;
  }

  if (root.kind === 'group') {
    return {
      ...root,
      children: root.children
        .map(child => removeNode(child, targetId))
        .filter((child): child is ConditionNode => child !== null),
    };
  }

  return root;
}

/**
 * Check if a node is a leaf (not a group).
 *
 * @param node - Node to check
 * @returns True if the node is a leaf node
 */
export function isLeafNode(node: ConditionNode): boolean {
  return node.kind !== 'group';
}

/**
 * Get all leaf nodes in the tree.
 *
 * @param node - Root node
 * @returns Array of all leaf nodes
 */
export function getLeafNodes(node: ConditionNode): ConditionNode[] {
  if (node.kind !== 'group') {
    return [node];
  }

  return node.children.flatMap(child => getLeafNodes(child));
}

/**
 * Count nodes of a specific kind in the tree.
 *
 * @param node - Root node
 * @param kind - Kind to count
 * @returns Count of nodes with that kind
 */
export function countNodesOfKind(node: ConditionNode, kind: ConditionNode['kind']): number {
  let count = node.kind === kind ? 1 : 0;

  if (node.kind === 'group') {
    count += node.children.reduce((sum, child) => sum + countNodesOfKind(child, kind), 0);
  }

  return count;
}

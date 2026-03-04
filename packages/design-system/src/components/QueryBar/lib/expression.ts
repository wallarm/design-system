import type { Condition, ExprNode, FilterOperator, Group } from '../types';

/**
 * Build an ExprNode from flat conditions + per-gap connectors.
 * AND has higher precedence than OR: conditions connected by AND
 * are grouped together, then those groups are joined by OR.
 */
export const buildExpression = (
  conditions: Condition[],
  connectors: Array<'and' | 'or'>,
): ExprNode | null => {
  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];

  // Split conditions into AND-groups by OR connectors
  const orGroups: Condition[][] = [[conditions[0]]];

  for (let i = 0; i < connectors.length; i++) {
    if (connectors[i] === 'or') {
      orGroups.push([conditions[i + 1]]);
    } else {
      orGroups[orGroups.length - 1].push(conditions[i + 1]);
    }
  }

  // Build nodes for each AND-group
  const andNodes: ExprNode[] = orGroups.map(group =>
    group.length === 1 ? group[0] : { type: 'group', operator: 'and', children: group },
  );

  if (andNodes.length === 1) return andNodes[0];
  return { type: 'group', operator: 'or', children: andNodes };
};

/**
 * Flatten a (possibly nested) ExprNode back to flat conditions + connectors.
 * Walks the tree depth-first; when transitioning between children of a group,
 * inserts the group's operator as the connector.
 */
export const expressionToConditions = (
  expr: ExprNode | null,
): { conditions: Condition[]; connectors: Array<'and' | 'or'> } => {
  if (!expr) return { conditions: [], connectors: [] };
  if (expr.type === 'condition') return { conditions: [expr], connectors: [] };

  const conditions: Condition[] = [];
  const connectors: Array<'and' | 'or'> = [];

  const walk = (node: ExprNode) => {
    if (node.type === 'condition') {
      conditions.push(node);
    } else {
      const group = node as Group;
      for (let i = 0; i < group.children.length; i++) {
        if (i > 0) {
          connectors.push(group.operator);
        }
        walk(group.children[i]);
      }
    }
  };

  walk(expr);
  return { conditions, connectors };
};

/** Map a chip ID (e.g. "chip-2") back to condition index */
export const chipIdToConditionIndex = (chipId: string): number | null => {
  const match = chipId.match(/^chip-(\d+)$/);
  return match ? Number(match[1]) : null;
};

/** Check if operator supports multi-select */
export const isMultiSelectOperator = (op: FilterOperator | null): boolean =>
  op === 'in' || op === 'not_in';

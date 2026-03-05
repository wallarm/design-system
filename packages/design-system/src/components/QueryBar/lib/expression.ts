import type { Condition, ExprNode } from '../types';

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
  if (conditions.length === 1) return conditions[0] ?? null;

  // Split conditions into AND-groups separated by OR connectors
  // Invariant: connectors.length === conditions.length - 1
  const first = conditions[0];
  if (!first) return null;

  const orGroups = connectors.reduce<Condition[][]>(
    (groups, connector, i) => {
      const next = conditions[i + 1];
      if (!next) return groups;
      if (connector === 'or') {
        groups.push([next]);
      } else {
        groups.at(-1)?.push(next);
      }
      return groups;
    },
    [[first]],
  );

  // Wrap each AND-group into a node
  const andNodes = orGroups.map<ExprNode>(group =>
    group.length === 1 && group[0] ? group[0] : { type: 'group', operator: 'and', children: group },
  );

  return andNodes.length === 1 && andNodes[0]
    ? andNodes[0]
    : { type: 'group', operator: 'or', children: andNodes };
};

/**
 * Flatten a (possibly nested) ExprNode back to flat conditions + connectors.
 * Walks the tree depth-first; between siblings inserts the parent's operator.
 */
export const expressionToConditions = (
  expr: ExprNode | null,
): { conditions: Condition[]; connectors: Array<'and' | 'or'> } => {
  if (!expr) return { conditions: [], connectors: [] };
  if (expr.type === 'condition') return { conditions: [expr], connectors: [] };

  const conditions: Condition[] = [];
  const connectors: Array<'and' | 'or'> = [];

  const walk = (node: ExprNode): void => {
    if (node.type === 'condition') {
      conditions.push(node);
      return;
    }
    node.children.forEach((child, i) => {
      if (i > 0) connectors.push(node.operator);
      walk(child);
    });
  };

  walk(expr);
  return { conditions, connectors };
};

import type { Condition, ExprNode, FilterOperator, Group } from '../types';

/** Build an ExprNode from conditions + connector operator */
export const buildExpression = (conditions: Condition[], connectorOp: 'and' | 'or'): ExprNode | null => {
  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  return { type: 'group', operator: connectorOp, children: conditions };
};

/** Extract conditions + connector from an ExprNode */
export const expressionToConditions = (expr: ExprNode | null): { conditions: Condition[]; connector: 'and' | 'or' } => {
  if (!expr) return { conditions: [], connector: 'and' };
  if (expr.type === 'condition') return { conditions: [expr], connector: 'and' };
  const group = expr as Group;
  const conditions = group.children.filter((c): c is Condition => c.type === 'condition');
  return { conditions, connector: group.operator };
};

/** Map a chip ID (e.g. "chip-2") back to condition index */
export const chipIdToConditionIndex = (chipId: string): number | null => {
  const match = chipId.match(/^chip-(\d+)$/);
  return match ? Number(match[1]) : null;
};

/** Check if operator supports multi-select */
export const isMultiSelectOperator = (op: FilterOperator | null): boolean =>
  op === 'in' || op === 'not_in';

import type { Condition, ExprNode, Group } from '../types';

const serializeValue = (condition: Condition): string => {
  if (condition.operator === 'is_null' || condition.operator === 'is_not_null') {
    return '';
  }

  if (Array.isArray(condition.value)) {
    const parts = condition.value.map(String);
    return `[${parts.join(', ')}]`;
  }

  return String(condition.value ?? '');
};

const serializeCondition = (condition: Condition): string => {
  const field = condition.field;
  const operator = condition.operator ?? '=';
  const value = serializeValue(condition);

  if (operator === 'is_null' || operator === 'is_not_null') {
    return `(${field} ${operator})`;
  }

  return `(${field} ${operator} ${value})`;
};

const sortConditions = (children: ExprNode[]): ExprNode[] =>
  [...children].sort((a, b) => {
    const aField = a.type === 'condition' ? a.field : '';
    const bField = b.type === 'condition' ? b.field : '';
    return aField.localeCompare(bField);
  });

const serializeGroup = (group: Group, isTopLevel: boolean): string => {
  const children = isTopLevel ? sortConditions(group.children) : group.children;
  const connector = group.operator === 'or' ? ' OR ' : ' AND ';
  return children.map(child => serializeNode(child, false)).join(connector);
};

const serializeNode = (node: ExprNode, isTopLevel: boolean): string => {
  if (node.type === 'condition') {
    return serializeCondition(node);
  }
  return serializeGroup(node, isTopLevel);
};

/**
 * Serialize an expression tree to a canonical text string.
 * Top-level conditions are sorted alphabetically by field name.
 */
export const serializeExpression = (expr: ExprNode | null): string => {
  if (!expr) return '';
  return serializeNode(expr, true);
};

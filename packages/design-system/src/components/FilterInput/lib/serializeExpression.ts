import type { Condition, ExprNode, FieldMetadata, Group } from '../types';
import { applyFieldValueTransforms } from './applyFieldValueTransforms';

const quoteValue = (v: string | number | boolean): string => `"${v}"`;

const serializeValue = (condition: Condition): string => {
  if (condition.operator === 'is_null' || condition.operator === 'is_not_null') {
    return '';
  }

  if (Array.isArray(condition.value)) {
    return `[${condition.value.map(quoteValue).join(', ')}]`;
  }

  return quoteValue(condition.value ?? '');
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
 *
 * When `fields` is passed, per-field `serializeValue` hooks run first so
 * the output carries the backend form of each value (e.g. a status-code
 * mask `"2XX"` becomes `"2"`). Call without `fields` to preserve the
 * UI-facing values verbatim.
 */
export const serializeExpression = (expr: ExprNode | null, fields?: FieldMetadata[]): string => {
  if (!expr) return '';
  const normalized = fields ? applyFieldValueTransforms(expr, fields) : expr;
  if (!normalized) return '';
  return serializeNode(normalized, true);
};

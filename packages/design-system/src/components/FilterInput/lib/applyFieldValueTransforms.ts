import type { Condition, ExprNode, FieldMetadata, Group } from '../types';

type Primitive = string | number | boolean;

const transformConditionValue = (
  condition: Condition,
  fieldsByName: Map<string, FieldMetadata>,
): Condition => {
  const field = fieldsByName.get(condition.field);
  const transform = field?.serializeValue;
  if (!transform) return condition;
  const { value } = condition;
  if (value == null) return condition;
  if (Array.isArray(value)) {
    const next = value.map(v => transform(v as Primitive));
    // Preserve identity if nothing changed
    if (next.every((v, i) => v === value[i])) return condition;
    return { ...condition, value: next };
  }
  const next = transform(value as Primitive);
  if (next === value) return condition;
  return { ...condition, value: next };
};

const transformGroup = (group: Group, fieldsByName: Map<string, FieldMetadata>): Group => {
  const children = group.children.map(child => transformNode(child, fieldsByName));
  // Preserve identity when nothing changed
  if (children.every((c, i) => c === group.children[i])) return group;
  return { ...group, children };
};

const transformNode = (node: ExprNode, fieldsByName: Map<string, FieldMetadata>): ExprNode => {
  if (node.type === 'condition') return transformConditionValue(node, fieldsByName);
  return transformGroup(node, fieldsByName);
};

/**
 * Walk an expression tree and apply each field's `serializeValue` hook to the
 * matching condition's value. Typical use: consumer has the UI-facing
 * `ExprNode` (e.g. status code chip with `"2XX"`) and wants the backend
 * payload to carry the transformed form (`"2"`).
 *
 * Returns the original node (by reference) when nothing changed, so
 * downstream memoization stays stable.
 */
export const applyFieldValueTransforms = (
  expr: ExprNode | null,
  fields: FieldMetadata[],
): ExprNode | null => {
  if (!expr) return expr;
  if (!fields.some(f => f.serializeValue)) return expr;
  const fieldsByName = new Map(fields.map(f => [f.name, f]));
  return transformNode(expr, fieldsByName);
};

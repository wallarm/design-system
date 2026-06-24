import type { Condition, ExprNode, FieldMetadata } from '../../types';

/**
 * Expand paired conditions into two AND-joined conditions for emit. A paired
 * field serializes as `field1 op1 v1 AND field2 op2 v2`; the second field's name
 * comes from the base field's `pairedField` config (not stored on `pair`), so
 * `fields` is required to expand. Conditions without a pair pass through.
 */
const expandPairs = (
  conditions: Condition[],
  connectors: Array<'and' | 'or'>,
  fields: FieldMetadata[],
): { conditions: Condition[]; connectors: Array<'and' | 'or'> } => {
  const outConditions: Condition[] = [];
  const outConnectors: Array<'and' | 'or'> = [];

  conditions.forEach((condition, i) => {
    if (i > 0) outConnectors.push(connectors[i - 1] ?? 'and');
    const field = fields.find(f => f.name === condition.field);
    if (condition.pair && field?.pairedField) {
      const { pair, ...base } = condition;
      outConditions.push(base);
      outConnectors.push('and');
      outConditions.push({
        type: 'condition',
        field: field.pairedField.name,
        ...(pair.operator && { operator: pair.operator }),
        value: pair.value,
        ...(pair.error && { error: pair.error }),
        ...(pair.dateOrigin && { dateOrigin: pair.dateOrigin }),
      });
    } else {
      outConditions.push(condition);
    }
  });

  return { conditions: outConditions, connectors: outConnectors };
};

/**
 * Build an ExprNode from flat conditions + per-gap connectors.
 * AND has higher precedence than OR: conditions connected by AND
 * are grouped together, then those groups are joined by OR.
 *
 * Pass `fields` to expand paired conditions into two AND-joined conditions
 * (the serialization contract). Omit it to keep paired conditions intact.
 */
export const buildExpression = (
  rawConditions: Condition[],
  rawConnectors: Array<'and' | 'or'>,
  fields?: FieldMetadata[],
): ExprNode | null => {
  const { conditions, connectors } = fields
    ? expandPairs(rawConditions, rawConnectors, fields)
    : { conditions: rawConditions, connectors: rawConnectors };
  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0] ?? null;

  // AND-groups separated by OR. Invariant: connectors.length === conditions.length - 1.
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

  const andNodes = orGroups.map<ExprNode>(group =>
    group.length === 1 && group[0] ? group[0] : { type: 'group', operator: 'and', children: group },
  );

  return andNodes.length === 1 && andNodes[0]
    ? andNodes[0]
    : { type: 'group', operator: 'or', children: andNodes };
};

/**
 * Collapse AND-adjacent conditions back into one paired condition when the left
 * condition's field declares a `pairedField` matching the right condition's
 * field. Inverse of `expandPairs` — keeps copy/paste and controlled round-trips
 * lossless. Only merges across an `and` connector; unrelated pairs pass through.
 */
const repairPairs = (
  conditions: Condition[],
  connectors: Array<'and' | 'or'>,
  fields: FieldMetadata[],
): { conditions: Condition[]; connectors: Array<'and' | 'or'> } => {
  const outConditions: Condition[] = [];
  const outConnectors: Array<'and' | 'or'> = [];

  let i = 0;
  while (i < conditions.length) {
    const condition = conditions[i]!;
    // Connector preceding this output condition is the one before its first
    // original condition — index-based so it stays correct after merges.
    if (i > 0) outConnectors.push(connectors[i - 1] ?? 'and');

    const field = fields.find(f => f.name === condition.field);
    const next = conditions[i + 1];
    const canMerge =
      field?.pairedField &&
      !condition.pair &&
      connectors[i] === 'and' &&
      next &&
      next.field === field.pairedField.name;

    if (canMerge && next) {
      outConditions.push({
        ...condition,
        pair: {
          ...(next.operator && { operator: next.operator }),
          value: next.value,
          ...(next.error && { error: next.error }),
          ...(next.dateOrigin && { dateOrigin: next.dateOrigin }),
        },
      });
      i += 2; // consume the base and the merged-in paired condition
    } else {
      outConditions.push(condition);
      i += 1;
    }
  }

  return { conditions: outConditions, connectors: outConnectors };
};

/**
 * Flatten a (possibly nested) ExprNode back to flat conditions + connectors.
 * Walks the tree depth-first; between siblings inserts the parent's operator.
 *
 * Pass `fields` to re-pair AND-adjacent conditions into paired conditions (the
 * inverse of `buildExpression`'s expansion). Omit it to keep them separate.
 */
export const expressionToConditions = (
  expr: ExprNode | null,
  fields?: FieldMetadata[],
): { conditions: Condition[]; connectors: Array<'and' | 'or'> } => {
  if (!expr) return { conditions: [], connectors: [] };

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

  return fields ? repairPairs(conditions, connectors, fields) : { conditions, connectors };
};

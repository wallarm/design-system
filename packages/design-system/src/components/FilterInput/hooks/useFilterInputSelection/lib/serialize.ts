import { serializeExpression } from '../../../lib';
import type { Condition } from '../../../types';
import { buildExpression } from '../../useFilterInputExpression/expression';
import { getSelectedConditionIndices } from './dom';

/** Serialize selected (drag) or all conditions into a text string */
export const serializeSelectedOrAll = (
  conditions: Condition[],
  connectors: Array<'and' | 'or'>,
  chipRegistry: Map<string, HTMLElement>,
): string => {
  const selectedIndices = getSelectedConditionIndices(chipRegistry);

  // Partial selection — serialize only drag-selected conditions
  if (selectedIndices.length > 0) {
    const selected = selectedIndices.flatMap(i => (conditions[i] ? [conditions[i]] : []));
    // connectors[n] is the connector between condition[n] and condition[n+1]
    const selectedConnectors = selectedIndices
      .slice(1)
      .map((_, i) => connectors[selectedIndices[i]!] ?? 'and');
    return serializeExpression(buildExpression(selected, selectedConnectors));
  }

  // All selected or no drag selection — serialize everything
  return serializeExpression(buildExpression(conditions, connectors));
};

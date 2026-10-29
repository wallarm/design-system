/**
 * ConditionSummary - Read-only condition tree display
 *
 * Displays a condition tree in a read-only format for review/confirmation.
 * Shows operator labels, nested groups with indentation, and condition details.
 */

import type { FC, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { Code } from '../../Code';
import { Tag } from '../../Tag';
import { Text } from '../../Text';
import { summaryCardVariants, summaryNestedVariants, summaryVariants } from '../classes';
import type { ConditionNode, GroupCondition } from '../types';
import { OPERATOR_CHOICES } from '../utils/constants';

export interface ConditionSummaryProps extends TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Condition tree to display */
  condition: GroupCondition;
  /** Additional CSS class */
  className?: string;
}

/**
 * Get human-readable operator label.
 */
function getOperatorLabel(operator: string): string {
  return OPERATOR_CHOICES.find(c => c.value === operator)?.label ?? operator;
}

/**
 * Render a single condition node in read-only format.
 */
const ConditionNodeSummary: FC<{ node: ConditionNode }> = ({ node }) => {
  switch (node.kind) {
    case 'field': {
      const { segments, condition: conditionType, value, ignoreCase } = node.value;

      // Build segment path display
      const path = segments.map(seg => seg.label || seg.text).join(' → ');

      return (
        <div className={cn(summaryCardVariants())}>
          <div className='flex flex-wrap items-center gap-4'>
            {segments.map((seg, i) => (
              <Tag key={i} size='medium'>
                {seg.label || seg.text}
              </Tag>
            ))}
          </div>
          <Text size='sm'>
            <span className='text-text-secondary'>{conditionType || 'condition not set'}</span>
            {value && (
              <>
                {' '}
                <span className='font-mono text-text-primary'>"{value}"</span>
              </>
            )}
            {ignoreCase && <span className='text-text-secondary'> (case-insensitive)</span>}
          </Text>
          {!conditionType && (
            <Text size='xs' color='secondary'>
              Incomplete condition
            </Text>
          )}
        </div>
      );
    }

    case 'attack': {
      return (
        <div className={cn(summaryCardVariants())}>
          <Text size='sm' weight='medium'>
            An attack was detected
          </Text>
          {node.attackType && (
            <Text size='sm' color='secondary'>
              Attack type: {node.attackType}
            </Text>
          )}
          {node.point && node.point !== 'flow' && (
            <Text size='sm' color='secondary'>
              At: {node.point}
            </Text>
          )}
        </div>
      );
    }

    case 'signal': {
      const signalLabels: Record<string, string> = {
        key_duplicate: 'Duplicate keys detected',
        resource_overlimit: 'Resource limit exceeded',
      };

      return (
        <div className={cn(summaryCardVariants())}>
          <Text size='sm' weight='medium'>
            {signalLabels[node.signalType] || 'A request anomaly was detected'}
          </Text>
          {node.signalType === 'key_duplicate' && (
            <Text size='sm' color='secondary'>
              In: {node.point}
            </Text>
          )}
          {node.signalType === 'resource_overlimit' && node.limit && (
            <Text size='sm' color='secondary'>
              Limit: {node.limit}
            </Text>
          )}
        </div>
      );
    }

    case 'group': {
      return (
        <div className={cn(summaryNestedVariants())}>
          <Text size='sm' weight='medium'>
            {getOperatorLabel(node.operator)} of:
          </Text>
          {node.children.length === 0 ? (
            <Text size='sm' color='secondary'>
              (empty group)
            </Text>
          ) : (
            node.children.map(child => <ConditionNodeSummary key={child.id} node={child} />)
          )}
        </div>
      );
    }

    case 'raw': {
      return (
        <div className={cn(summaryCardVariants())}>
          <Text size='xs' color='secondary'>
            Raw condition (cannot be edited):
          </Text>
          <Code size='s' className='break-all'>
            {JSON.stringify(node.check, null, 2)}
          </Code>
        </div>
      );
    }

    default:
      return null;
  }
};

/**
 * ConditionSummary component.
 *
 * Displays a condition tree in read-only format for review/confirmation.
 *
 * @example
 * ```tsx
 * <ConditionSummary condition={condition} />
 * ```
 */
export const ConditionSummary: FC<ConditionSummaryProps> = ({
  ref,
  'data-testid': testIdProp,
  condition,
  className,
}) => {
  const testId = useTestId('condition-summary');
  const finalTestId = testIdProp ?? testId;

  return (
    <TestIdProvider value={finalTestId}>
      <div
        ref={ref}
        data-slot='condition-summary'
        data-testid={finalTestId}
        className={cn(summaryVariants(), className)}
      >
        <div className='flex items-center gap-8'>
          <Text size='sm' weight='medium'>
            If a request matches {getOperatorLabel(condition.operator).toLowerCase()}:
          </Text>
        </div>

        {condition.children.length === 0 ? (
          <Text size='sm' color='secondary'>
            No conditions — the rule applies to every request.
          </Text>
        ) : (
          <div className='flex flex-col gap-8'>
            {condition.children.map(child => (
              <ConditionNodeSummary key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    </TestIdProvider>
  );
};

ConditionSummary.displayName = 'ConditionSummary';

/**
 * ActionSummary - Read-only action display
 *
 * Displays an action configuration in a read-only format for review/confirmation.
 * Shows action description, target, and all relevant fields based on action type.
 */

import type { FC, Ref } from 'react';
import { Code } from '../../../Code';
import { Tag } from '../../../Tag';
import { Text } from '../../../Text';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import { summaryCardVariants, summaryVariants } from '../classes';
import type { ActionDraft, Choice } from '../types';
import { ACTION_KIND_CHOICES } from '../utils/constants';

export interface ActionSummaryProps extends TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Action configuration to display */
  action: ActionDraft;
  /** Available attack types for label lookup */
  attackTypes: Choice[];
  /** Additional CSS class */
  className?: string;
}

/**
 * Get human-readable action description.
 */
function getActionLabel(kind: string): string {
  return ACTION_KIND_CHOICES.find(c => c.value === kind)?.label ?? kind;
}

/**
 * Get attack type label from value.
 */
function getAttackTypeLabel(value: string, choices: Choice[]): string {
  return choices.find(c => c.value === value)?.label ?? value;
}

/**
 * Format target location for display.
 */
function formatTarget(action: ActionDraft): string {
  if (action.target.whole) {
    return 'Entire request';
  }

  if (action.target.segments.length === 0) {
    return 'No target specified';
  }

  return action.target.segments.map(seg => seg.label || seg.text).join(' → ');
}

/**
 * ActionSummary component.
 *
 * Displays an action configuration in read-only format for review/confirmation.
 *
 * @example
 * ```tsx
 * <ActionSummary
 *   action={action}
 *   attackTypes={attackTypeChoices}
 * />
 * ```
 */
export const ActionSummary: FC<ActionSummaryProps> = ({
  ref,
  'data-testid': testIdProp,
  action,
  attackTypes,
  className,
}) => {
  const testId = useTestId('action-summary');
  const finalTestId = testIdProp ?? testId;

  // Handle raw actions
  if (action.kind === 'raw') {
    return (
      <TestIdProvider value={finalTestId}>
        <div
          ref={ref}
          data-slot='action-summary'
          data-testid={finalTestId}
          className={cn(summaryVariants(), className)}
        >
          <div className={cn(summaryCardVariants())}>
            <Text size='sm' color='secondary'>
              Raw action (cannot be edited):
            </Text>
            <Code size='s' className='break-all'>
              {JSON.stringify(action.raw, null, 2)}
            </Code>
          </div>
        </div>
      </TestIdProvider>
    );
  }

  const targetDisplay = formatTarget(action);

  return (
    <TestIdProvider value={finalTestId}>
      <div
        ref={ref}
        data-slot='action-summary'
        data-testid={finalTestId}
        className={cn(summaryVariants(), className)}
      >
        <div className={cn(summaryCardVariants())}>
          {/* Action type */}
          <Text size='sm' weight='medium'>
            Then: {getActionLabel(action.kind)}
          </Text>

          {/* Action-specific fields */}
          {action.kind === 'add_attack' && (
            <>
              {action.attackType && (
                <div className='flex flex-col gap-4'>
                  <Text size='sm' color='secondary'>
                    Attack type:
                  </Text>
                  <Tag size='medium'>{getAttackTypeLabel(action.attackType, attackTypes)}</Tag>
                </div>
              )}
              {action.comment && (
                <Text size='sm' color='secondary'>
                  Comment: {action.comment}
                </Text>
              )}
            </>
          )}

          {action.kind === 'add_tag' && (
            <div className='flex flex-col gap-4'>
              <Text size='sm' color='secondary'>
                Tag:
              </Text>
              <div className='flex items-center gap-4'>
                <Tag size='medium'>{action.tagKey || '(no key)'}</Tag>
                <Text size='sm'>=</Text>
                <Tag size='medium'>{action.tagValue || '(no value)'}</Tag>
              </div>
            </div>
          )}

          {action.kind === 'suppress_attack' && action.attackType && (
            <div className='flex flex-col gap-4'>
              <Text size='sm' color='secondary'>
                Attack type to suppress:
              </Text>
              <Tag size='medium'>{getAttackTypeLabel(action.attackType, attackTypes)}</Tag>
            </div>
          )}

          {action.kind === 'mark_attack' && action.attackType && (
            <div className='flex flex-col gap-4'>
              <Text size='sm' color='secondary'>
                Attack type to mark:
              </Text>
              <Tag size='medium'>{getAttackTypeLabel(action.attackType, attackTypes)}</Tag>
            </div>
          )}

          {action.kind === 'combine' && (
            <>
              <Text size='sm' color='secondary'>
                Separator: "{action.separator || ', '}"
              </Text>
            </>
          )}

          {action.kind === 'processing_time_limit' && action.limit && (
            <Text size='sm' color='secondary'>
              Time limit: {action.limit}
            </Text>
          )}

          {action.kind === 'processing_space_limit' && action.limit && (
            <Text size='sm' color='secondary'>
              Memory limit: {action.limit}
            </Text>
          )}

          {action.kind === 'entry_limits' && (
            <>
              {action.softLimit && (
                <Text size='sm' color='secondary'>
                  Soft limit: {action.softLimit}
                </Text>
              )}
              {action.hardLimit && (
                <Text size='sm' color='secondary'>
                  Hard limit: {action.hardLimit}
                </Text>
              )}
            </>
          )}

          {/* Target location */}
          {action.kind !== 'processing_time_limit' && action.kind !== 'processing_space_limit' && (
            <div className='flex flex-col gap-4'>
              <Text size='sm' color='secondary'>
                {action.kind === 'combine' ? 'Join repeated keys in:' : 'Applies to:'}
              </Text>
              <div className='flex flex-wrap items-center gap-4'>
                {action.target.whole ? (
                  <Tag size='medium'>{targetDisplay}</Tag>
                ) : (
                  action.target.segments.map((seg, i) => (
                    <Tag key={i} size='medium'>
                      {seg.label || seg.text}
                    </Tag>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Experimental mode */}
          {action.experimental && (
            <div className='flex items-center gap-4'>
              <Tag size='medium'>Experimental</Tag>
            </div>
          )}

          {/* Priority */}
          {action.priority && (
            <Text size='sm' color='secondary'>
              Priority: {action.priority}
            </Text>
          )}
        </div>
      </div>
    </TestIdProvider>
  );
};

ActionSummary.displayName = 'ActionSummary';

/**
 * ActionEditor
 *
 * Main action configuration component.
 * Orchestrates action type selection, fields, and target picker.
 */

import type { FC } from 'react';
import { Code } from '../../../Code';
import { Field, FieldLabel } from '../../../Field';
import { Text } from '../../../Text';
import type { TestableProps } from '../../../utils/testId';
import { newAction } from '../models/actionModel';
import { ChoiceSelect } from '../shared/ChoiceSelect';
import type { ActionDraft, ActionKind, Choice, GroupCondition } from '../types';
import { ACTION_KIND_CHOICES, TARGET_REQUIREMENT } from '../utils/constants';
import { ActionFields } from './ActionFields';
import { ActionTargetPicker } from './ActionTargetPicker';
import { ActionTypeSelect } from './ActionTypeSelect';

const ROW = 'flex flex-col gap-6';
const WIDE = { maxWidth: 420 } as const;

export interface ActionEditorProps extends TestableProps {
  /** Current action draft */
  value: ActionDraft;
  /** Called when action changes */
  onChange: (value: ActionDraft) => void;
  /** Available attack types for selection */
  attackTypes: Choice[];
  /** Current condition tree (for extracting bindings) */
  condition: GroupCondition;
  /** Validation problems to display */
  problems?: string[];
  /** Show validation errors */
  showProblems?: boolean;
}

/**
 * Action configuration editor.
 * Handles all 12 action types with conditional field rendering.
 */
export const ActionEditor: FC<ActionEditorProps> = ({
  value,
  onChange,
  attackTypes,
  condition,
  problems = [],
  showProblems = false,
  'data-testid': testId,
}) => {
  const kind = value.kind;

  // Raw action fallback (uneditable)
  if (kind === 'raw') {
    return (
      <div className={ROW} data-testid={testId} data-slot='action-editor'>
        <Text size='sm' color='secondary'>
          This action cannot be edited here yet; it is kept as written. Pick another action to
          replace it.
        </Text>
        <Code size='s' className='break-all'>
          {JSON.stringify(value.raw)}
        </Code>
        <div style={WIDE}>
          <ChoiceSelect
            label='Replace with'
            placeholder='Replace with another action'
            value=''
            choices={ACTION_KIND_CHOICES}
            onChange={v => v && onChange(newAction(v as ActionKind))}
          />
        </div>
      </div>
    );
  }

  const handleKindChange = (newKind: ActionKind) => {
    // Preserve attack type when switching between attack-related actions
    const preservedAction = newAction(newKind);
    if (value.attackType && 'attackType' in preservedAction) {
      preservedAction.attackType = value.attackType;
    }
    onChange(preservedAction);
  };

  return (
    <div className='flex flex-col gap-12' data-testid={testId} data-slot='action-editor'>
      {/* Action type selector */}
      <div className='flex flex-wrap items-center gap-8'>
        <Text size='sm'>Then</Text>
        <div style={{ width: 360 }}>
          <ActionTypeSelect value={kind} onChange={handleKindChange} testId='action-kind' />
        </div>
      </div>

      {/* Action-specific fields */}
      <ActionFields
        action={value}
        onChange={onChange}
        attackTypes={attackTypes}
        condition={condition}
      />

      {/* Target picker (if action requires target) */}
      {TARGET_REQUIREMENT[kind] !== 'flow' && (
        <Field>
          <FieldLabel>{kind === 'combine' ? 'Join repeated keys in' : 'Applies to'}</FieldLabel>
          <ActionTargetPicker action={value} onChange={onChange} />
        </Field>
      )}

      {/* Validation problems */}
      {showProblems && problems.length > 0 && (
        <div className='flex flex-col gap-2'>
          {problems.map(p => (
            <Text key={p} size='sm' color='danger'>
              {p}
            </Text>
          ))}
        </div>
      )}
    </div>
  );
};

ActionEditor.displayName = 'ActionEditor';

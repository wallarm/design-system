/**
 * ActionTypeSelect
 *
 * Dropdown for selecting action kind.
 */

import type { FC } from 'react';
import { ChoiceSelect } from '../shared/ChoiceSelect';
import type { ActionKind } from '../types';
import { ACTION_KIND_CHOICES } from '../utils/constants';

export interface ActionTypeSelectProps {
  /** Current action kind */
  value: ActionKind;
  /** Called when action kind changes */
  onChange: (kind: ActionKind) => void;
  /** Test ID for the select button */
  testId?: string;
}

/**
 * Action kind selector dropdown.
 * Displays human-readable labels for all 12 action types.
 */
export const ActionTypeSelect: FC<ActionTypeSelectProps> = ({ value, onChange, testId }) => {
  return (
    <ChoiceSelect
      label='What the rule does'
      value={value}
      choices={ACTION_KIND_CHOICES}
      testId={testId}
      onChange={v => v && onChange(v as ActionKind)}
    />
  );
};

ActionTypeSelect.displayName = 'ActionTypeSelect';

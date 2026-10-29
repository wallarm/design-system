/**
 * ChoiceSelect
 *
 * Reusable Select component for RuleBuilder choice lists.
 * Wraps design system Select with consistent patterns.
 */

import { type FC, useMemo } from 'react';
import {
  createListCollection,
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../Select';
import type { Choice } from '../types';

export interface ChoiceSelectProps {
  /** Accessible name */
  label: string;
  /** Current selected value */
  value: string;
  /** Available choices */
  choices: Choice[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Test ID for the button */
  testId?: string;
}

/**
 * Single-select dropdown for RuleBuilder choice lists.
 * Used for action types, operators, signal types, etc.
 */
export const ChoiceSelect: FC<ChoiceSelectProps> = ({
  label,
  value,
  choices,
  placeholder,
  onChange,
  testId,
}) => {
  const collection = useMemo(() => createListCollection({ items: choices }), [choices]);
  const selected = useMemo(() => (value ? [value] : []), [value]);

  return (
    <Select
      collection={collection}
      value={selected}
      onValueChange={details => onChange(details.value[0] ?? '')}
    >
      <SelectButton aria-label={label} placeholder={placeholder ?? label} data-testid={testId} />
      <SelectPositioner>
        <SelectContent>
          {collection.items.map(item => (
            <SelectOption key={item.value} item={item}>
              <SelectOptionText>{item.label}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>
  );
};

ChoiceSelect.displayName = 'ChoiceSelect';

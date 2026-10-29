/**
 * AttackTypeField
 *
 * Specialized field for selecting attack types.
 * Allows selecting from known types or entering a custom type.
 */

import { type FC, useState } from 'react';
import { Input } from '../../Input';
import { ChoiceSelect } from '../shared/ChoiceSelect';
import type { Choice } from '../types';

const OTHER = '__other__';

export interface AttackTypeFieldProps {
  /** Current attack type value */
  value: string;
  /** Available attack type choices */
  choices: Choice[];
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Allow empty value (any attack) - used in filters */
  allowAny?: boolean;
}

/**
 * Attack type selector with custom type input option.
 * Used for add_attack, suppress_attack, and mark_attack actions.
 */
export const AttackTypeField: FC<AttackTypeFieldProps> = ({
  value,
  choices,
  onChange,
  allowAny,
}) => {
  const known = choices.some(c => c.value === value);
  const [typing, setTyping] = useState(value !== '' && !known);

  const options: Choice[] = [
    ...(allowAny ? [{ value: '', label: 'Any attack' }] : []),
    ...choices,
    { value: OTHER, label: 'Another type…' },
  ];

  return (
    <div className='flex flex-wrap items-center gap-8'>
      <div style={{ width: 260 }}>
        <ChoiceSelect
          label='Attack type'
          placeholder={allowAny ? 'Any attack' : 'Choose an attack type'}
          value={typing ? OTHER : value}
          choices={options}
          onChange={v => {
            if (v === OTHER) {
              setTyping(true);
              onChange('');
            } else {
              setTyping(false);
              onChange(v);
            }
          }}
        />
      </div>
      {typing && (
        <div style={{ width: 220 }}>
          <Input
            aria-label='Attack type name'
            placeholder='attack type, e.g. acl_violation'
            value={value}
            onChange={e => onChange(e.target.value.trim())}
          />
        </div>
      )}
    </div>
  );
};

AttackTypeField.displayName = 'AttackTypeField';

/**
 * AttackCondition
 *
 * "An attack was detected" condition.
 * Allows selecting attack type and detection point.
 */

import type { FC } from 'react';
import { useMemo } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import type { SelectValueChangeDetails } from '@ark-ui/react/select';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../../../Checkbox';
import { Field, FieldDescription, FieldLabel } from '../../../Field';
import { Input } from '../../../Input';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../../Select';
import { Text } from '../../../Text';
import type { AttackCondition as AttackConditionType, Choice } from '../types';
import { ATTACK_SOURCE_CHOICES, XML_PROPERTY_CHOICES } from '../utils/constants';
import { ConditionCard } from './ConditionCard';

export interface AttackConditionProps {
  condition: AttackConditionType;
  onChange: (condition: AttackConditionType) => void;
  onRemove: () => void;
  attackTypes: Choice[];
}

export const AttackCondition: FC<AttackConditionProps> = ({
  condition,
  onChange,
  onRemove,
  attackTypes,
}) => {
  const attackCollection = useMemo(
    () =>
      createListCollection({
        items: attackTypes,
      }),
    [attackTypes],
  );

  const sourceCollection = useMemo(
    () =>
      createListCollection({
        items: ATTACK_SOURCE_CHOICES,
      }),
    [],
  );

  const xmlPropertyCollection = useMemo(
    () =>
      createListCollection({
        items: XML_PROPERTY_CHOICES,
      }),
    [],
  );

  const handleAttackTypeChange = (details: SelectValueChangeDetails<Choice>) => {
    const attackType = details.value[0] || '';
    onChange({
      ...condition,
      attackType,
    });
  };

  const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...condition,
      point: e.target.value,
    });
  };

  const handleSourceChange = (details: SelectValueChangeDetails<Choice>) => {
    const source = details.value[0] || undefined;
    // Reset filter fields when source changes
    onChange({
      ...condition,
      source,
      stampIds: source === 'stamp' ? condition.stampIds : undefined,
      ruleIds: source === 'rule' ? condition.ruleIds : undefined,
      property: source === 'xml' ? condition.property : undefined,
      reference: source === 'xml' ? condition.reference : undefined,
    });
  };

  return (
    <ConditionCard onRemove={onRemove} removeLabel='Remove attack condition'>
      <div className='flex flex-wrap items-center gap-8'>
        <Text size='sm'>An attack of type</Text>
        <div className='w-240'>
          <Select
            collection={attackCollection}
            value={condition.attackType ? [condition.attackType] : []}
            onValueChange={handleAttackTypeChange}
          >
            <SelectButton aria-label='Attack type' placeholder='Choose an attack type' />
            <SelectPositioner>
              <SelectContent>
                {attackCollection.items.map(choice => (
                  <SelectOption key={choice.value} item={choice}>
                    <SelectOptionText>{choice.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </div>
        <Text size='sm'>{condition.absent ? 'was NOT detected' : 'was detected'}</Text>
      </div>

      <Checkbox
        checked={condition.absent === true}
        onCheckedChange={d => onChange({ ...condition, absent: d.checked === true })}
      >
        <CheckboxIndicator />
        <CheckboxLabel>Attack is NOT present (negated check)</CheckboxLabel>
      </Checkbox>

      <Field>
        <FieldLabel>Detection point (canonical string)</FieldLabel>
        <Input
          value={condition.point}
          onChange={handlePointChange}
          placeholder='flow'
          className='font-mono text-sm'
        />
        <FieldDescription>Use "flow" for anywhere, or a specific point</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Bind name (optional)</FieldLabel>
        <Input
          value={condition.bindAttack ?? ''}
          onChange={e => onChange({ ...condition, bindAttack: e.target.value || undefined })}
          placeholder='e.g., "a"'
          className='font-mono text-sm w-160'
        />
        <FieldDescription>
          Bind matched attacks to this name for use in actions (bind_attack). Format 0.10.1+
        </FieldDescription>
      </Field>

      {/* Attack source filter */}
      <div className='rounded-8 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-8 text-sm font-medium text-text-primary'>
          Attack source filters (optional)
        </div>
        <Field>
          <FieldLabel>Source</FieldLabel>
          <Select
            collection={sourceCollection}
            value={condition.source ? [condition.source] : []}
            onValueChange={handleSourceChange}
          >
            <SelectButton placeholder='Any source' />
            <SelectPositioner>
              <SelectContent>
                {sourceCollection.items.map(choice => (
                  <SelectOption key={choice.value} item={choice}>
                    <div className='flex flex-col'>
                      <SelectOptionText>{choice.label}</SelectOptionText>
                      {choice.description && (
                        <Text size='xs' color='secondary'>
                          {choice.description}
                        </Text>
                      )}
                    </div>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
          <FieldDescription>Filter attacks by detection source</FieldDescription>
        </Field>

        {/* Stamp IDs filter (when source: 'stamp') */}
        {condition.source === 'stamp' && (
          <Field>
            <FieldLabel>Stamp IDs</FieldLabel>
            <Input
              value={(condition.stampIds ?? []).join(', ')}
              onChange={e => {
                const val = e.target.value.trim();
                const stampIds = val === '' ? undefined : val.split(/\s*,\s*/);
                onChange({ ...condition, stampIds });
              }}
              placeholder='stamp-1, stamp-2, ...'
            />
            <FieldDescription>Comma-separated stamp identifiers</FieldDescription>
          </Field>
        )}

        {/* Rule IDs filter (when source: 'rule') */}
        {condition.source === 'rule' && (
          <Field>
            <FieldLabel>Rule IDs</FieldLabel>
            <Input
              value={
                Array.isArray(condition.ruleIds)
                  ? condition.ruleIds.join(', ')
                  : (condition.ruleIds ?? '')
              }
              onChange={e => {
                const val = e.target.value.trim();
                const ruleIds = val === '' ? undefined : val.split(/\s*,\s*/);
                onChange({ ...condition, ruleIds });
              }}
              placeholder='rule-uuid-1, rule-uuid-2, ...'
            />
            <FieldDescription>Comma-separated rule identifiers</FieldDescription>
          </Field>
        )}

        {/* XML property filter (when source: 'xml') */}
        {condition.source === 'xml' && (
          <>
            <Field>
              <FieldLabel>XML Property</FieldLabel>
              <Select
                collection={xmlPropertyCollection}
                value={
                  Array.isArray(condition.property)
                    ? condition.property
                    : condition.property
                      ? [condition.property]
                      : []
                }
                onValueChange={details => {
                  const property =
                    details.value.length === 0
                      ? undefined
                      : details.value.length === 1
                        ? details.value[0]
                        : details.value;
                  onChange({ ...condition, property });
                }}
                multiple
              >
                <SelectButton placeholder='Any property' />
                <SelectPositioner>
                  <SelectContent>
                    {xmlPropertyCollection.items.map(choice => (
                      <SelectOption key={choice.value} item={choice}>
                        <div className='flex flex-col'>
                          <SelectOptionText>{choice.label}</SelectOptionText>
                          {choice.description && (
                            <Text size='xs' color='secondary'>
                              {choice.description}
                            </Text>
                          )}
                        </div>
                        <SelectOptionIndicator />
                      </SelectOption>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
              <FieldDescription>Filter by XML property type (dtd, xinclude, etc.)</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Reference operator (optional)</FieldLabel>
              <Select
                collection={useMemo(
                  () =>
                    createListCollection({
                      items: [
                        {
                          value: 'equal',
                          label: 'Equal',
                          description: 'Exact match (full or relative URL)',
                        },
                        {
                          value: 'startswith',
                          label: 'Starts with',
                          description: 'Full http:// or https:// URL prefix',
                        },
                        {
                          value: 'regex',
                          label: 'Regex',
                          description: 'Regular expression (must start with http:// or https://)',
                        },
                      ],
                    }),
                  [],
                )}
                value={condition.reference?.operator ? [condition.reference.operator] : []}
                onValueChange={details => {
                  const operator = details.value[0] as 'equal' | 'startswith' | 'regex' | undefined;
                  if (!operator) {
                    onChange({ ...condition, reference: undefined });
                  } else {
                    onChange({
                      ...condition,
                      reference: {
                        operator,
                        value: condition.reference?.value ?? '',
                      },
                    });
                  }
                }}
              >
                <SelectButton placeholder='No reference filter' />
                <SelectPositioner>
                  <SelectContent>
                    {[
                      {
                        value: 'equal',
                        label: 'Equal',
                        description: 'Exact match (full or relative URL)',
                      },
                      {
                        value: 'startswith',
                        label: 'Starts with',
                        description: 'Full http:// or https:// URL prefix',
                      },
                      {
                        value: 'regex',
                        label: 'Regex',
                        description: 'Regular expression (must start with http:// or https://)',
                      },
                    ].map(choice => (
                      <SelectOption key={choice.value} item={choice}>
                        <div className='flex flex-col'>
                          <SelectOptionText>{choice.label}</SelectOptionText>
                          <Text size='xs' color='secondary'>
                            {choice.description}
                          </Text>
                        </div>
                        <SelectOptionIndicator />
                      </SelectOption>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
              <FieldDescription>
                Filter by external reference URI (format 0.10.3). Only matches xxe attacks with a
                target.
              </FieldDescription>
            </Field>

            {condition.reference?.operator && (
              <Field>
                <FieldLabel>Reference value(s)</FieldLabel>
                <Input
                  value={
                    Array.isArray(condition.reference.value)
                      ? condition.reference.value.join(', ')
                      : (condition.reference.value ?? '')
                  }
                  onChange={e => {
                    const val = e.target.value.trim();
                    const value = val === '' ? '' : val.includes(',') ? val.split(/\s*,\s*/) : val;
                    onChange({
                      ...condition,
                      reference: condition.reference
                        ? { ...condition.reference, value }
                        : undefined,
                    });
                  }}
                  placeholder='http://example.com/schema.dtd (comma-separate for OR)'
                  className='font-mono text-sm'
                />
                <FieldDescription>
                  {condition.reference.operator === 'equal' && 'Full or relative URL(s) to match'}
                  {condition.reference.operator === 'startswith' &&
                    'Full URL(s) with scheme, authority, and trailing / (e.g., http://www.w3.org/)'}
                  {condition.reference.operator === 'regex' &&
                    'Regex pattern(s) - must start with ^http:// or ^https://'}
                </FieldDescription>
              </Field>
            )}
          </>
        )}
      </div>
    </ConditionCard>
  );
};

AttackCondition.displayName = 'AttackCondition';

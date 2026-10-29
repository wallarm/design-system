/**
 * SignalCondition
 *
 * "A request anomaly was detected" condition.
 * Supports key_duplicate and resource_overlimit signal types.
 */

import type { FC } from 'react';
import { useMemo } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import type { SelectValueChangeDetails } from '@ark-ui/react/select';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../../Checkbox';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../Select';
import { Text } from '../../Text';
import type { Choice, SignalCondition as SignalConditionType, SignalType } from '../types';
import { DUPLICATE_CONTAINERS, RESOURCE_LIMITS, SIGNAL_TYPE_CHOICES } from '../utils/constants';
import { ConditionCard } from './ConditionCard';

export interface SignalConditionProps {
  condition: SignalConditionType;
  onChange: (condition: SignalConditionType) => void;
  onRemove: () => void;
}

export const SignalCondition: FC<SignalConditionProps> = ({ condition, onChange, onRemove }) => {
  const signalCollection = useMemo(
    () =>
      createListCollection({
        items: SIGNAL_TYPE_CHOICES,
      }),
    [],
  );

  const containerCollection = useMemo(
    () =>
      createListCollection({
        items: DUPLICATE_CONTAINERS,
      }),
    [],
  );

  const limitCollection = useMemo(
    () =>
      createListCollection({
        items: RESOURCE_LIMITS,
      }),
    [],
  );

  const handleSignalTypeChange = (details: SelectValueChangeDetails<Choice>) => {
    const signalType = details.value[0] || '';
    // Reset point/limit when signal type changes
    // key_duplicate: default to header container
    // resource_overlimit: default to flow (user can change for entry limits)
    const newPoint = signalType === 'key_duplicate' ? '[http:header]' : 'flow';
    onChange({
      ...condition,
      signalType: signalType as SignalType | '',
      point: newPoint,
      limit: '',
    });
  };

  const handlePointChange = (details: SelectValueChangeDetails<Choice>) => {
    const point = details.value[0] || '[http:header]';
    onChange({
      ...condition,
      point,
    });
  };

  const handleLimitChange = (details: SelectValueChangeDetails<Choice>) => {
    const limit = details.value[0] || '';
    onChange({
      ...condition,
      limit,
    });
  };

  return (
    <ConditionCard onRemove={onRemove} removeLabel='Remove anomaly condition'>
      <div className='flex flex-wrap items-center gap-8'>
        <Text size='sm'>The request</Text>
        <div className='w-300'>
          <Select
            collection={signalCollection}
            value={condition.signalType ? [condition.signalType] : []}
            onValueChange={handleSignalTypeChange}
          >
            <SelectButton aria-label='Request anomaly' placeholder='Choose an anomaly' />
            <SelectPositioner>
              <SelectContent>
                {signalCollection.items.map(choice => (
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
        </div>

        {condition.signalType === 'key_duplicate' && (
          <>
            <Text size='sm'>in</Text>
            <div className='w-240'>
              <Select
                collection={containerCollection}
                value={[condition.point]}
                onValueChange={handlePointChange}
              >
                <SelectButton aria-label='Where keys repeat' />
                <SelectPositioner>
                  <SelectContent>
                    {containerCollection.items.map(choice => (
                      <SelectOption key={choice.value} item={choice}>
                        <SelectOptionText>{choice.label}</SelectOptionText>
                        <SelectOptionIndicator />
                      </SelectOption>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
            </div>
          </>
        )}

        {condition.signalType === 'resource_overlimit' && (
          <div className='w-260'>
            <Select
              collection={limitCollection}
              value={condition.limit ? [condition.limit] : []}
              onValueChange={handleLimitChange}
            >
              <SelectButton aria-label='Which limit' placeholder='Any limit' />
              <SelectPositioner>
                <SelectContent>
                  {limitCollection.items.map(choice => (
                    <SelectOption key={choice.value} item={choice}>
                      <SelectOptionText>{choice.label}</SelectOptionText>
                      <SelectOptionIndicator />
                    </SelectOption>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>
          </div>
        )}
      </div>

      <Checkbox
        checked={condition.absent === true}
        onCheckedChange={d => onChange({ ...condition, absent: d.checked === true })}
      >
        <CheckboxIndicator />
        <CheckboxLabel>Signal is NOT present (negated check)</CheckboxLabel>
      </Checkbox>

      {condition.signalType === 'key_duplicate' && (
        <>
          <Field>
            <FieldLabel>Container point (canonical string)</FieldLabel>
            <Input
              value={condition.point}
              onChange={e => {
                onChange({
                  ...condition,
                  point: e.target.value,
                });
              }}
              placeholder='[http:header]'
              className='font-mono text-sm'
            />
            <FieldDescription>
              The container whose keys repeat (e.g., [http:header], [http:query])
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Duplicated key (optional)</FieldLabel>
            <Input
              value={condition.key ?? ''}
              onChange={e => {
                onChange({
                  ...condition,
                  key: e.target.value || undefined,
                });
              }}
              placeholder="['cookie']"
              className='font-mono text-sm'
            />
            <FieldDescription>
              The specific key that repeats. Leave empty to check for any duplicate.
            </FieldDescription>
          </Field>
        </>
      )}

      {/* Point field for entry limits */}
      {condition.signalType === 'resource_overlimit' &&
        (condition.limit === 'entry_size_soft_limit' ||
          condition.limit === 'entry_size_hard_limit') && (
          <Field>
            <FieldLabel>Entry point (canonical string)</FieldLabel>
            <Input
              value={condition.point}
              onChange={e => {
                onChange({
                  ...condition,
                  point: e.target.value,
                });
              }}
              placeholder='[**]'
              className='font-mono text-sm'
            />
            <FieldDescription>
              The entry where the size limit applies (e.g., [http:body][**] for any body entry)
            </FieldDescription>
          </Field>
        )}

      <Field>
        <FieldLabel>Bind point (optional)</FieldLabel>
        <Input
          value={condition.bindPoint ?? ''}
          onChange={e => onChange({ ...condition, bindPoint: e.target.value || undefined })}
          placeholder='e.g., "s"'
          className='font-mono text-sm w-160'
        />
        <FieldDescription>
          Bind matched nodes for use in actions (bind_point). Format 0.10.1+
        </FieldDescription>
      </Field>
    </ConditionCard>
  );
};

SignalCondition.displayName = 'SignalCondition';

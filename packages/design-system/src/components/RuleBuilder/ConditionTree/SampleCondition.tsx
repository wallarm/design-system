/**
 * SampleCondition
 *
 * "Sample a percentage of flows" condition.
 * Takes a percent value (0-100), no context or point.
 */

import type { FC } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import { Text } from '../../Text';
import type { SampleCondition as SampleConditionType } from '../types';
import { ConditionCard } from './ConditionCard';

export interface SampleConditionProps {
  condition: SampleConditionType;
  onChange: (condition: SampleConditionType) => void;
  onRemove: () => void;
}

export const SampleCondition: FC<SampleConditionProps> = ({ condition, onChange, onRemove }) => {
  return (
    <ConditionCard onRemove={onRemove} removeLabel='Remove sample condition'>
      <div className='flex flex-col gap-12'>
        <div className='flex flex-wrap items-center gap-8'>
          <Text size='sm'>Sample</Text>
          <div style={{ width: 100 }}>
            <Input
              type='number'
              inputMode='numeric'
              min={0}
              max={100}
              value={condition.percent}
              onChange={e => {
                const val = Number(e.target.value);
                onChange({
                  ...condition,
                  percent: Number.isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
                });
              }}
              className='text-center'
            />
          </div>
          <Text size='sm'>% of flows</Text>
        </div>

        <Field>
          <FieldLabel>Sample percent</FieldLabel>
          <FieldDescription>
            Percentage of flows to sample (0-100). The rule will fire for approximately this
            percentage of requests, selected by flow ID hash.
          </FieldDescription>
        </Field>
      </div>
    </ConditionCard>
  );
};

SampleCondition.displayName = 'SampleCondition';

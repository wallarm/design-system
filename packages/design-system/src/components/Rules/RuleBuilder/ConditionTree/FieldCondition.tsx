/**
 * FieldCondition
 *
 * Condition on a value in the request or response.
 * Integrates PointSelector for point selection and condition definition.
 */

import type { FC } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../../Field';
import { Input } from '../../../Input';
import { PointSelector } from '../../../PointSelector';
import type { RuleContext } from '../../../PointSelector/types';
import { SegmentedControl, SegmentedControlItem } from '../../../SegmentedControl';
import { newField } from '../models/conditionModel';
import type { FieldCondition as FieldConditionType } from '../types';
import { ConditionCard } from './ConditionCard';

export interface FieldConditionProps {
  condition: FieldConditionType;
  onChange: (condition: FieldConditionType) => void;
  onRemove: () => void;
}

export const FieldCondition: FC<FieldConditionProps> = ({ condition, onChange, onRemove }) => {
  const handleContextChange = (context: string) => {
    // When context changes, reset the field to avoid cross-context point confusion
    const newContext = context === 'http_response' ? 'http_response' : 'http_request';
    onChange({
      ...newField(newContext as RuleContext),
      id: condition.id, // Keep same ID for React keys
    });
  };

  const handleValueChange = (value: FieldConditionType['value']) => {
    onChange({
      ...condition,
      value,
    });
  };

  return (
    <ConditionCard onRemove={onRemove} removeLabel='Remove condition'>
      <div className='flex'>
        <SegmentedControl value={condition.context} onChange={handleContextChange}>
          <SegmentedControlItem value='http_request'>Request</SegmentedControlItem>
          <SegmentedControlItem value='http_response'>Response</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <PointSelector
        key={`${condition.id}:${condition.context}`}
        context={condition.context}
        value={condition.value}
        onChange={handleValueChange}
      />

      {/* Binding fields (format 0.10.1+) */}
      <div className='flex flex-wrap gap-12'>
        <Field>
          <FieldLabel>Bind point (optional)</FieldLabel>
          <Input
            value={condition.bindPoint ?? ''}
            onChange={e => onChange({ ...condition, bindPoint: e.target.value || undefined })}
            placeholder='e.g., "n"'
            className='font-mono text-sm w-120'
          />
          <FieldDescription>Bind matched nodes for use in actions (bind_point)</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Point ref (optional)</FieldLabel>
          <Input
            value={condition.pointRef ?? ''}
            onChange={e => onChange({ ...condition, pointRef: e.target.value || undefined })}
            placeholder='e.g., "p1"'
            className='font-mono text-sm w-120'
          />
          <FieldDescription>Point reference name (point_ref)</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Point role (optional)</FieldLabel>
          <Input
            value={condition.pointRole ?? ''}
            onChange={e => onChange({ ...condition, pointRole: e.target.value || undefined })}
            placeholder='e.g., "before"'
            className='font-mono text-sm w-120'
          />
          <FieldDescription>Point role modifier (point_role)</FieldDescription>
        </Field>
      </div>
    </ConditionCard>
  );
};

FieldCondition.displayName = 'FieldCondition';

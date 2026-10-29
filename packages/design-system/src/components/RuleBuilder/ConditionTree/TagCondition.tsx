/**
 * TagCondition
 *
 * "A tag is present/absent" condition.
 * Checks for the presence or absence of a tag at a specific point.
 */

import type { FC } from 'react';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../../Checkbox';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import { Text } from '../../Text';
import type { TagCondition as TagConditionType } from '../types';
import { ConditionCard } from './ConditionCard';

export interface TagConditionProps {
  condition: TagConditionType;
  onChange: (condition: TagConditionType) => void;
  onRemove: () => void;
}

export const TagCondition: FC<TagConditionProps> = ({ condition, onChange, onRemove }) => {
  return (
    <ConditionCard onRemove={onRemove} removeLabel='Remove tag condition'>
      <div className='flex flex-col gap-12'>
        <div className='flex flex-wrap items-center gap-8'>
          <Text size='sm'>The request has</Text>
          <Text size='sm' weight='medium'>
            {condition.absent ? 'no tag' : 'tag'}
          </Text>
        </div>

        <div className='flex flex-wrap gap-12'>
          <div style={{ width: 220 }}>
            <Field>
              <FieldLabel>Tag key</FieldLabel>
              <Input
                value={condition.tagKey}
                onChange={e =>
                  onChange({
                    ...condition,
                    tagKey: e.target.value,
                  })
                }
                placeholder='my-tag-key'
              />
            </Field>
          </div>

          <div style={{ width: 220 }}>
            <Field>
              <FieldLabel>Tag value (optional)</FieldLabel>
              <Input
                value={condition.tagValue}
                onChange={e =>
                  onChange({
                    ...condition,
                    tagValue: e.target.value,
                  })
                }
                placeholder='Any value'
              />
              <FieldDescription>Leave empty to match any value</FieldDescription>
            </Field>
          </div>
        </div>

        <Field>
          <FieldLabel>Point</FieldLabel>
          <Input
            value={condition.point}
            onChange={e =>
              onChange({
                ...condition,
                point: e.target.value,
              })
            }
            placeholder='flow'
            className='font-mono text-sm'
          />
          <FieldDescription>
            Use "flow" for anywhere in the request, or a specific point
          </FieldDescription>
        </Field>

        <Checkbox
          checked={condition.absent === true}
          onCheckedChange={d =>
            onChange({
              ...condition,
              absent: d.checked === true || undefined,
            })
          }
        >
          <CheckboxIndicator />
          <CheckboxLabel>Check that tag is NOT present (tag_absent)</CheckboxLabel>
        </Checkbox>
      </div>
    </ConditionCard>
  );
};

TagCondition.displayName = 'TagCondition';

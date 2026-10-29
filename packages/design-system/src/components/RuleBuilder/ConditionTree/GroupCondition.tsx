/**
 * GroupCondition
 *
 * Nested group of conditions with its own operator.
 * Renders recursively via ConditionTree.
 */

import type { FC } from 'react';
import { Trash2 } from '../../../icons';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import type { Choice, GroupCondition as GroupConditionType } from '../types';
import { conditionTreeVariants, groupBorderVariants } from './classes';

// Forward reference - will be set by ConditionTree
let ConditionTreeComponent: FC<{
  condition: GroupConditionType;
  onChange: (condition: GroupConditionType) => void;
  isRoot?: boolean;
  insideNone?: boolean;
  attackTypes: Choice[];
}>;

export function setConditionTreeComponent(component: typeof ConditionTreeComponent) {
  ConditionTreeComponent = component;
}

export interface GroupConditionProps {
  condition: GroupConditionType;
  onChange: (condition: GroupConditionType) => void;
  onRemove: () => void;
  insideNone?: boolean;
  attackTypes: Choice[];
}

export const GroupCondition: FC<GroupConditionProps> = ({
  condition,
  onChange,
  onRemove,
  insideNone,
  attackTypes,
}) => {
  return (
    <div className={cn(conditionTreeVariants({ variant: 'nested' }))}>
      <div className={cn(groupBorderVariants({ color: 'primary' }))} />
      <div className='flex items-center justify-between gap-8'>
        <div className='flex-1'>
          {ConditionTreeComponent && (
            <ConditionTreeComponent
              condition={condition}
              onChange={onChange}
              isRoot={false}
              insideNone={insideNone}
              attackTypes={attackTypes}
            />
          )}
        </div>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Remove group'
          onClick={onRemove}
          className='self-start'
        >
          <Trash2 />
          Remove group
        </Button>
      </div>
    </div>
  );
};

GroupCondition.displayName = 'GroupCondition';

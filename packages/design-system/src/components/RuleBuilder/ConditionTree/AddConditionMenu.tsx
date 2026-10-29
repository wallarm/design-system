/**
 * AddConditionMenu
 *
 * Dropdown menu for adding new conditions to the tree.
 * Shows 6 options: field, attack, signal, tag, sample, or group.
 * Conditionally hides attack/signal when inside a 'not' group.
 */

import type { FC } from 'react';
import { Plus } from '../../../icons';
import { useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemText,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import type { ConditionNode } from '../types';

export interface AddConditionMenuProps {
  onAdd: (node: ConditionNode) => void;
  /** True when inside a 'not' group - hides attack/signal options */
  insideNone?: boolean;
  /** Factory functions for creating new nodes */
  factories: {
    field: () => ConditionNode;
    attack: () => ConditionNode;
    signal: () => ConditionNode;
    tag: () => ConditionNode;
    sample: () => ConditionNode;
    group: () => ConditionNode;
  };
}

export const AddConditionMenu: FC<AddConditionMenuProps> = ({
  onAdd,
  insideNone = false,
  factories,
}) => {
  const testId = useTestId('add-condition');

  return (
    <DropdownMenu positioning={{ placement: 'bottom-start' }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          color='neutral'
          size='small'
          data-slot='add-condition-trigger'
          data-testid={testId}
        >
          <Plus />
          Add condition
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onAdd(factories.field())}>
          <div className='flex flex-col'>
            <DropdownMenuItemText>A value in the request or response</DropdownMenuItemText>
            <DropdownMenuItemDescription>
              A header, a field in the body, the path…
            </DropdownMenuItemDescription>
          </div>
        </DropdownMenuItem>

        {!insideNone && (
          <DropdownMenuItem onSelect={() => onAdd(factories.attack())}>
            <div className='flex flex-col'>
              <DropdownMenuItemText>An attack was detected</DropdownMenuItemText>
              <DropdownMenuItemDescription>
                Another rule or the detector found an attack of a given type
              </DropdownMenuItemDescription>
            </div>
          </DropdownMenuItem>
        )}

        {!insideNone && (
          <DropdownMenuItem onSelect={() => onAdd(factories.signal())}>
            <div className='flex flex-col'>
              <DropdownMenuItemText>A request anomaly was detected</DropdownMenuItemText>
              <DropdownMenuItemDescription>
                For example, a parameter sent more than once
              </DropdownMenuItemDescription>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onSelect={() => onAdd(factories.tag())}>
          <div className='flex flex-col'>
            <DropdownMenuItemText>A tag is present or absent</DropdownMenuItemText>
            <DropdownMenuItemDescription>
              Check for tags added by other rules
            </DropdownMenuItemDescription>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onAdd(factories.sample())}>
          <div className='flex flex-col'>
            <DropdownMenuItemText>Sample a percentage of flows</DropdownMenuItemText>
            <DropdownMenuItemDescription>
              Apply the rule to a random sample of requests
            </DropdownMenuItemDescription>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onAdd(factories.group())}>
          <div className='flex flex-col'>
            <DropdownMenuItemText>A group of conditions</DropdownMenuItemText>
            <DropdownMenuItemDescription>
              Its own all / any / none, inside this one
            </DropdownMenuItemDescription>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

AddConditionMenu.displayName = 'AddConditionMenu';

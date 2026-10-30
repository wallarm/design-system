/**
 * ConditionTree
 *
 * Main recursive renderer for condition trees.
 * Displays operator selector, list of conditions, and add button.
 */

import type { FC, Ref } from 'react';
import { useEffect, useMemo } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import type { SelectValueChangeDetails } from '@ark-ui/react/select';
import { Code } from '../../../Code';
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
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../../utils/testId';
import {
  newAttack,
  newField,
  newGroup,
  newSample,
  newSignal,
  newTag,
} from '../models/conditionModel';
import type {
  Choice,
  ConditionNode,
  GroupCondition as GroupConditionType,
  GroupOperator,
} from '../types';
import { OPERATOR_CHOICES } from '../utils/constants';
import { AddConditionMenu } from './AddConditionMenu';
import { AttackCondition } from './AttackCondition';
import { conditionTreeVariants } from './classes';
import { FieldCondition } from './FieldCondition';
import { GroupCondition, setConditionTreeComponent } from './GroupCondition';
import { SampleCondition } from './SampleCondition';
import { SignalCondition } from './SignalCondition';
import { TagCondition } from './TagCondition';

export interface ConditionTreeProps extends TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Root group condition */
  condition: GroupConditionType;
  /** Called when tree changes */
  onChange: (condition: GroupConditionType) => void;
  /** Whether this is the root node */
  isRoot?: boolean;
  /** Validation problems to display */
  problems?: string[];
  /** Show validation errors */
  showProblems?: boolean;
  /** Inside a 'not' group (affects what can be added) */
  insideNone?: boolean;
  /** Available attack types */
  attackTypes: Choice[];
}

/**
 * Check if a node or its descendants contain attack or signal checks.
 */
function hasSignalChecks(node: ConditionNode): boolean {
  return (
    node.kind === 'attack' ||
    node.kind === 'signal' ||
    (node.kind === 'group' && node.children.some(hasSignalChecks))
  );
}

export const ConditionTree: FC<ConditionTreeProps> = ({
  ref,
  'data-testid': testIdProp,
  condition,
  onChange,
  isRoot = true,
  problems = [],
  showProblems = false,
  insideNone = false,
  attackTypes,
}) => {
  const testId = useTestId(isRoot ? 'condition-tree' : 'condition-group');
  const finalTestId = testIdProp ?? testId;

  // Set up recursive reference
  useEffect(() => {
    setConditionTreeComponent(ConditionTree);
  }, []);

  const noneHere = insideNone || condition.operator === 'not';
  const signalUnderNone = noneHere && condition.children.some(hasSignalChecks);

  const operatorCollection = useMemo(
    () =>
      createListCollection({
        items: OPERATOR_CHOICES,
      }),
    [],
  );

  const handleOperatorChange = (details: SelectValueChangeDetails<Choice>) => {
    const operator = details.value[0] || 'and';
    onChange({
      ...condition,
      operator: operator as GroupOperator,
    });
  };

  const handleChildChange = (index: number, next: ConditionNode | null) => {
    onChange({
      ...condition,
      children: next
        ? condition.children.map((c, i) => (i === index ? next : c))
        : condition.children.filter((_, i) => i !== index),
    });
  };

  const handleAdd = (node: ConditionNode) => {
    onChange({
      ...condition,
      children: [...condition.children, node],
    });
  };

  return (
    <TestIdProvider value={finalTestId}>
      <div
        ref={ref}
        data-slot='condition-tree'
        data-testid={finalTestId}
        className={cn(conditionTreeVariants({ variant: isRoot ? 'root' : 'nested' }))}
      >
        <div className='flex flex-wrap items-center gap-8'>
          <Text size='sm'>{isRoot ? 'If a request matches' : 'Matches'}</Text>
          <div className='w-96'>
            <Select
              collection={operatorCollection}
              value={[condition.operator]}
              onValueChange={handleOperatorChange}
            >
              <SelectButton aria-label='How the conditions combine' />
              <SelectPositioner>
                <SelectContent>
                  {operatorCollection.items.map(choice => (
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
          <Text size='sm'>of these conditions</Text>
        </div>

        {signalUnderNone && showProblems && (
          <Text size='sm' color='danger'>
            "None of" cannot contain "an attack was detected" or "a request anomaly" — the rule
            could never react to them. Use "all" or "any", or remove those conditions.
          </Text>
        )}

        {condition.children.length === 0 && (
          <Text size='sm' color='secondary'>
            No conditions: the rule applies to every request.
          </Text>
        )}

        {condition.children.map((node, index) => {
          const remove = () => handleChildChange(index, null);

          switch (node.kind) {
            case 'field':
              return (
                <FieldCondition
                  key={node.id}
                  condition={node}
                  onChange={next => handleChildChange(index, next)}
                  onRemove={remove}
                />
              );

            case 'attack':
              return (
                <AttackCondition
                  key={node.id}
                  condition={node}
                  onChange={next => handleChildChange(index, next)}
                  onRemove={remove}
                  attackTypes={attackTypes}
                />
              );

            case 'signal':
              return (
                <SignalCondition
                  key={node.id}
                  condition={node}
                  onChange={next => handleChildChange(index, next)}
                  onRemove={remove}
                />
              );

            case 'tag':
              return (
                <TagCondition
                  key={node.id}
                  condition={node}
                  onChange={next => handleChildChange(index, next)}
                  onRemove={remove}
                />
              );

            case 'sample':
              return (
                <SampleCondition
                  key={node.id}
                  condition={node}
                  onChange={next => handleChildChange(index, next)}
                  onRemove={remove}
                />
              );

            case 'group':
              return (
                <GroupCondition
                  key={node.id}
                  condition={node}
                  onChange={next => handleChildChange(index, next)}
                  onRemove={remove}
                  insideNone={noneHere}
                  attackTypes={attackTypes}
                />
              );

            case 'raw':
              return (
                <div
                  key={node.id}
                  className='flex flex-col gap-8 rounded-12 border border-border-primary-light p-12'
                >
                  <Text size='xs' color='secondary'>
                    This condition cannot be edited here yet; it is kept as written.
                  </Text>
                  <Code size='s' className='break-all'>
                    {JSON.stringify(node.check)}
                  </Code>
                </div>
              );

            default:
              return null;
          }
        })}

        <AddConditionMenu
          onAdd={handleAdd}
          insideNone={noneHere}
          factories={{
            field: () => newField(),
            attack: () => newAttack(),
            signal: () => newSignal(),
            tag: () => newTag(),
            sample: () => newSample(),
            group: () => newGroup('or'),
          }}
        />

        {showProblems && problems.length > 0 && (
          <div className='flex flex-col gap-4'>
            {problems.map((problem, i) => (
              <Text key={i} size='sm' color='danger'>
                {problem}
              </Text>
            ))}
          </div>
        )}
      </div>
    </TestIdProvider>
  );
};

ConditionTree.displayName = 'ConditionTree';

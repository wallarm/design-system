/**
 * ConditionTree Tests
 *
 * Component tests for ConditionTree and sub-components.
 */

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { newAttack, newField, newGroup, newSignal } from '../models/conditionModel';
import type { Choice, GroupCondition } from '../types';
import { ConditionTree } from './ConditionTree';

const mockAttackTypes: Choice[] = [
  { value: 'sqli', label: 'SQL Injection' },
  { value: 'xss', label: 'Cross-Site Scripting' },
];

describe('ConditionTree', () => {
  it('renders root group with operator selector', () => {
    const condition = newGroup();
    const onChange = rs.fn();

    render(
      <ConditionTree condition={condition} onChange={onChange} attackTypes={mockAttackTypes} />,
    );

    expect(screen.getByText('If a request matches')).toBeInTheDocument();
    expect(screen.getByLabelText('How the conditions combine')).toBeInTheDocument();
    expect(screen.getByText('of these conditions')).toBeInTheDocument();
  });

  it('renders nested group with different text', () => {
    const condition = newGroup();
    const onChange = rs.fn();

    render(
      <ConditionTree
        condition={condition}
        onChange={onChange}
        isRoot={false}
        attackTypes={mockAttackTypes}
      />,
    );

    expect(screen.getByText('Matches')).toBeInTheDocument();
  });

  it('shows empty state when no children', () => {
    const condition: GroupCondition = {
      kind: 'group',
      id: 'test-group',
      operator: 'and',
      children: [],
    };
    const onChange = rs.fn();

    render(
      <ConditionTree condition={condition} onChange={onChange} attackTypes={mockAttackTypes} />,
    );

    expect(
      screen.getByText('No conditions: the rule applies to every request.'),
    ).toBeInTheDocument();
  });

  it('renders field condition', () => {
    const condition: GroupCondition = {
      kind: 'group',
      id: 'test-group',
      operator: 'and',
      children: [newField()],
    };
    const onChange = rs.fn();

    render(
      <ConditionTree condition={condition} onChange={onChange} attackTypes={mockAttackTypes} />,
    );

    expect(screen.getByText('Request')).toBeInTheDocument();
    expect(screen.getByText('Response')).toBeInTheDocument();
  });

  it('renders attack condition', () => {
    const condition: GroupCondition = {
      kind: 'group',
      id: 'test-group',
      operator: 'and',
      children: [newAttack()],
    };
    const onChange = rs.fn();

    render(
      <ConditionTree condition={condition} onChange={onChange} attackTypes={mockAttackTypes} />,
    );

    expect(screen.getByText('An attack of type')).toBeInTheDocument();
    expect(screen.getByText('was detected')).toBeInTheDocument();
  });

  it('renders signal condition', () => {
    const condition: GroupCondition = {
      kind: 'group',
      id: 'test-group',
      operator: 'and',
      children: [newSignal()],
    };
    const onChange = rs.fn();

    render(
      <ConditionTree condition={condition} onChange={onChange} attackTypes={mockAttackTypes} />,
    );

    expect(screen.getByText('The request')).toBeInTheDocument();
  });

  it('shows add condition button', () => {
    const condition = newGroup();
    const onChange = rs.fn();

    render(
      <ConditionTree condition={condition} onChange={onChange} attackTypes={mockAttackTypes} />,
    );

    expect(screen.getByText('Add condition')).toBeInTheDocument();
  });

  it('shows warning when attack/signal under none', () => {
    const condition: GroupCondition = {
      kind: 'group',
      id: 'test-group',
      operator: 'not',
      children: [newAttack()],
    };
    const onChange = rs.fn();

    render(
      <ConditionTree
        condition={condition}
        onChange={onChange}
        showProblems={true}
        attackTypes={mockAttackTypes}
      />,
    );

    expect(screen.getByText(/None of.*cannot contain.*attack was detected/i)).toBeInTheDocument();
  });

  it('displays validation problems when showProblems is true', () => {
    const condition = newGroup();
    const onChange = rs.fn();
    const problems = ['Problem 1', 'Problem 2'];

    render(
      <ConditionTree
        condition={condition}
        onChange={onChange}
        problems={problems}
        showProblems={true}
        attackTypes={mockAttackTypes}
      />,
    );

    expect(screen.getByText('Problem 1')).toBeInTheDocument();
    expect(screen.getByText('Problem 2')).toBeInTheDocument();
  });

  it('does not display problems when showProblems is false', () => {
    const condition = newGroup();
    const onChange = rs.fn();
    const problems = ['Problem 1'];

    render(
      <ConditionTree
        condition={condition}
        onChange={onChange}
        problems={problems}
        showProblems={false}
        attackTypes={mockAttackTypes}
      />,
    );

    expect(screen.queryByText('Problem 1')).not.toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    const condition = newGroup();
    const onChange = rs.fn();

    render(
      <ConditionTree
        condition={condition}
        onChange={onChange}
        data-testid='custom-testid'
        attackTypes={mockAttackTypes}
      />,
    );

    expect(screen.getByTestId('custom-testid')).toBeInTheDocument();
  });
});

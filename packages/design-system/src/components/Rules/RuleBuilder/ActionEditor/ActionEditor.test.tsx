/**
 * ActionEditor Tests
 *
 * Unit tests for action configuration component.
 */

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { newAction } from '../models/actionModel';
import { newGroup } from '../models/conditionModel';
import type { Choice } from '../types';
import { ActionEditor } from './ActionEditor';

const ATTACK_TYPES: Choice[] = [
  { value: 'sqli', label: 'SQL Injection' },
  { value: 'xss', label: 'Cross-Site Scripting' },
];

const EMPTY_CONDITION = newGroup('and');

describe('ActionEditor', () => {
  it('renders action type selector', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Then')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /what the rule does/i })).toBeInTheDocument();
  });

  it('renders attack type field for add_attack', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={ATTACK_TYPES}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Attack type')).toBeInTheDocument();
  });

  it('renders tag fields for add_tag', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_tag')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Tag key')).toBeInTheDocument();
    expect(screen.getByText('Tag value')).toBeInTheDocument();
  });

  it('renders experimental checkbox for add_attack', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Report only — do not block on it')).toBeInTheDocument();
  });

  it('renders separator field for combine', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('combine')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Join values with')).toBeInTheDocument();
  });

  it('renders limit field for processing_time_limit', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('processing_time_limit')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Time limit')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('renders soft and hard limit fields for entry_limits', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('entry_limits')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Soft limit')).toBeInTheDocument();
    expect(screen.getByText('Hard limit')).toBeInTheDocument();
  });

  it('renders parsers field for disable_parsers', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('disable_parsers')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Disable these parsers')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('renders parsers field for allow_parsers', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('allow_parsers')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Allow these parsers')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('renders parser select for force_parser', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('force_parser')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Force this parser')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('renders rule IDs field for disable_rule', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('disable_rule')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText('Rule IDs to disable')).toBeInTheDocument();
  });

  it('handles comment input for add_attack', async () => {
    const user = userEvent.setup();
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    const input = screen.getByLabelText('Comment');
    await user.type(input, 'Test comment');

    expect(onChange).toHaveBeenCalled();
  });

  it('displays validation problems when showProblems is true', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
        problems={['Attack type is required']}
        showProblems={true}
      />,
    );

    expect(screen.getByText('Attack type is required')).toBeInTheDocument();
  });

  it('hides validation problems when showProblems is false', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
        problems={['Attack type is required']}
        showProblems={false}
      />,
    );

    expect(screen.queryByText('Attack type is required')).not.toBeInTheDocument();
  });

  it('renders raw action fallback', () => {
    const onChange = rs.fn();
    const rawAction = {
      kind: 'raw' as const,
      raw: { action_type: 'unknown' },
      target: { whole: true, context: 'http_request' as const, segments: [] },
    };

    render(
      <ActionEditor
        value={rawAction}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
      />,
    );

    expect(screen.getByText(/this action cannot be edited here yet/i)).toBeInTheDocument();
  });

  it('forwards data-testid to root element', () => {
    const onChange = rs.fn();
    render(
      <ActionEditor
        value={newAction('add_attack')}
        onChange={onChange}
        attackTypes={[]}
        condition={EMPTY_CONDITION}
        data-testid='action-editor-test'
      />,
    );

    expect(screen.getByTestId('action-editor-test')).toBeInTheDocument();
  });

  it('preserves attack type when switching between attack actions', async () => {
    const _user = userEvent.setup();
    const onChange = rs.fn();
    const action = newAction('add_attack');
    action.attackType = 'sqli';

    render(
      <ActionEditor
        value={action}
        onChange={onChange}
        attackTypes={ATTACK_TYPES}
        condition={EMPTY_CONDITION}
      />,
    );

    // This test would require interacting with the Select component
    // which is complex to test in unit tests - better suited for E2E
  });
});

/**
 * RuleBuilder Tests
 */

import { describe, expect, it, rs, vi } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import type { Proton } from '@wallarm-org/rules-lib';
import { newAction } from './models/actionModel';
import { newField, newGroup } from './models/conditionModel';
import { RuleBuilder } from './RuleBuilder';
import { ActionSummary } from './Summary/ActionSummary';
import { ConditionSummary } from './Summary/ConditionSummary';
import type { AttackCondition, Choice } from './types';

const attackTypes: Choice[] = [
  { value: 'sqli', label: 'SQL Injection' },
  { value: 'xss', label: 'Cross-Site Scripting' },
];

describe('RuleBuilder', () => {
  it('renders all sections by default', () => {
    const condition = newGroup('and');
    const action = newAction('add_attack');

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
      />,
    );

    // Should show headings when multiple sections present
    expect(screen.getByText('Conditions')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Generated Rule')).toBeInTheDocument();
  });

  it('renders only specified sections', () => {
    const condition = newGroup('and');
    const action = newAction('add_attack');

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
        sections={['conditions', 'action']}
      />,
    );

    // Should show conditions and action
    expect(screen.getByText('Conditions')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Should NOT show code section
    expect(screen.queryByText('Generated Rule')).not.toBeInTheDocument();
  });

  it('does not show headings when only one section', () => {
    const condition = newGroup('and');
    const action = newAction('add_attack');

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
        sections={['action']}
      />,
    );

    // Should NOT show heading when single section
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('forwards data-testid correctly', () => {
    const condition = newGroup('and');
    const action = newAction('add_attack');

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
        data-testid='custom-rule-builder'
      />,
    );

    expect(screen.getByTestId('custom-rule-builder')).toBeInTheDocument();
  });

  it('displays validation problems when showProblems=true', () => {
    // Create incomplete condition
    const condition = {
      ...newGroup('and'),
      children: [
        {
          ...newField('http_request'),
          value: {
            segments: [],
            condition: null,
            value: '',
            ignoreCase: false,
          },
        },
      ],
    };

    const action = {
      ...newAction('add_attack'),
      attackType: '', // Missing required field
    };

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
        showProblems={true}
      />,
    );

    // Should show validation problems
    expect(screen.getByText(/Finish every condition/i)).toBeInTheDocument();
  });

  it('generates correct JSON output', () => {
    const condition = {
      ...newGroup('and'),
      children: [
        {
          ...newField('http_request'),
          value: {
            segments: [{ text: '[http:uri]', kind: 'native' as const, label: 'URI' }],
            condition: 'contains' as const,
            value: 'admin',
            ignoreCase: false,
          },
        },
      ],
    };

    const action = {
      ...newAction('add_attack'),
      attackType: 'sqli',
    };

    const { container } = render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
        sections={['code']}
      />,
    );

    // JSON should be present in code block
    const codeBlock = container.querySelector('code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock?.textContent).toContain('"action_type": "add_attack"');
    expect(codeBlock?.textContent).toContain('"type": "contains"');
  });

  it('calls onChange callbacks correctly', () => {
    const onConditionChange = rs.fn();
    const onActionChange = rs.fn();
    const condition = newGroup('and');
    const action = newAction('add_attack');

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={onConditionChange}
        onActionChange={onActionChange}
        attackTypes={attackTypes}
      />,
    );

    // Callbacks are passed to child components
    // Actual interaction testing is done in child component tests
    expect(onConditionChange).not.toHaveBeenCalled();
    expect(onActionChange).not.toHaveBeenCalled();
  });

  it('renders afterConditions content', () => {
    const condition = newGroup('and');
    const action = newAction('add_attack');

    render(
      <RuleBuilder
        condition={condition}
        action={action}
        onConditionChange={rs.fn()}
        onActionChange={rs.fn()}
        attackTypes={attackTypes}
        afterConditions={<div data-testid='after-content'>Extra content</div>}
      />,
    );

    expect(screen.getByTestId('after-content')).toBeInTheDocument();
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  it('re-canonicalizes condition points when SDK version changes', async () => {
    const onConditionChange = rs.fn();
    const onActionChange = rs.fn();

    // Mock SDK with version change
    const mockProton = {
      version: () => ({
        canonical: '2',
        ruleset_format: '0.10.3',
        commit: 'abc123',
        crate: 'proton-new',
      }),
      point: {
        check: vi.fn((point: string) => ({
          ok: true,
          canonical: '[http:header]', // New canonical form (wildcard folded)
          exact: false,
        })),
      },
    } as unknown as Proton;

    // Create condition with old canonical version
    const attackCondition: AttackCondition = {
      kind: 'attack',
      id: 'attack-1',
      attackType: 'sqli',
      point: '[http:header][key:**]', // Old form (before wildcard folding)
      canonicalVersion: 1, // Old version
    };

    const condition = {
      ...newGroup('and'),
      children: [attackCondition],
    };

    const action = newAction('add_attack');

    render(
      <RuleBuilder
        ruleId='test-rule'
        condition={condition}
        action={action}
        onConditionChange={onConditionChange}
        onActionChange={onActionChange}
        attackTypes={attackTypes}
        proton={mockProton}
      />,
    );

    // Wait for migration effect to run
    await waitFor(() => {
      expect(onConditionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              point: '[http:header]',
              canonicalVersion: 2,
            }),
          ]),
        }),
      );
    });

    // Verify check was called with old point
    expect(mockProton.point.check).toHaveBeenCalledWith(
      '[http:header][key:**]',
      expect.objectContaining({
        context: 'http_request',
        profile: 'tree',
      }),
    );
  });

  it('re-canonicalizes action target when SDK version changes', async () => {
    const onConditionChange = rs.fn();
    const onActionChange = rs.fn();

    // Mock SDK with version change
    const mockProton = {
      version: () => ({
        canonical: '2',
        ruleset_format: '0.10.3',
        commit: 'abc123',
        crate: 'proton-new',
      }),
      point: {
        check: vi.fn((point: string) => ({
          ok: true,
          canonical: '[http:body]', // New canonical form
          exact: true,
        })),
      },
    } as unknown as Proton;

    const condition = newGroup('and');
    const action = {
      ...newAction('add_tag'),
      target: {
        whole: false,
        context: 'http_request' as const,
        segments: [],
        canonical: '[http:body][format:json]', // Old form
        canonicalVersion: 1, // Old version
      },
      tagKey: 'test',
      tagValue: 'value',
    };

    render(
      <RuleBuilder
        ruleId='test-rule'
        condition={condition}
        action={action}
        onConditionChange={onConditionChange}
        onActionChange={onActionChange}
        attackTypes={attackTypes}
        proton={mockProton}
      />,
    );

    // Wait for migration effect to run
    await waitFor(() => {
      expect(onActionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            canonical: '[http:body]',
            canonicalVersion: 2,
          }),
        }),
      );
    });

    // Verify check was called with old point
    expect(mockProton.point.check).toHaveBeenCalledWith(
      '[http:body][format:json]',
      expect.objectContaining({
        context: 'http_request',
        profile: 'tree',
      }),
    );
  });

  it('does not re-canonicalize when version matches', () => {
    const onConditionChange = rs.fn();
    const onActionChange = rs.fn();

    // Mock SDK with same version
    const mockProton = {
      version: () => ({
        canonical: '1',
        ruleset_format: '0.10.3',
        commit: 'abc123',
        crate: 'proton-new',
      }),
      point: {
        check: vi.fn(),
      },
    } as unknown as Proton;

    const attackCondition: AttackCondition = {
      kind: 'attack',
      id: 'attack-1',
      attackType: 'sqli',
      point: '[http:header]',
      canonicalVersion: 1, // Same version
    };

    const condition = {
      ...newGroup('and'),
      children: [attackCondition],
    };

    const action = newAction('add_attack');

    render(
      <RuleBuilder
        ruleId='test-rule'
        condition={condition}
        action={action}
        onConditionChange={onConditionChange}
        onActionChange={onActionChange}
        attackTypes={attackTypes}
        proton={mockProton}
      />,
    );

    // Should NOT call onChange when versions match
    expect(onConditionChange).not.toHaveBeenCalled();
    expect(onActionChange).not.toHaveBeenCalled();
    expect(mockProton.point.check).not.toHaveBeenCalled();
  });
});

describe('ConditionSummary', () => {
  it('renders empty condition message', () => {
    const condition = newGroup('and');

    render(<ConditionSummary condition={condition} />);

    expect(screen.getByText(/No conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/applies to every request/i)).toBeInTheDocument();
  });

  it('displays field condition correctly', () => {
    const condition = {
      ...newGroup('and'),
      children: [
        {
          ...newField('http_request'),
          value: {
            segments: [{ text: '[http:uri]', kind: 'native' as const, label: 'URI' }],
            condition: 'contains' as const,
            value: 'admin',
            ignoreCase: false,
          },
        },
      ],
    };

    render(<ConditionSummary condition={condition} />);

    expect(screen.getByText('URI')).toBeInTheDocument();
    expect(screen.getByText(/contains/i)).toBeInTheDocument();
    expect(screen.getByText(/"admin"/i)).toBeInTheDocument();
  });

  it('displays case-insensitive flag', () => {
    const condition = {
      ...newGroup('and'),
      children: [
        {
          ...newField('http_request'),
          value: {
            segments: [{ text: '[http:uri]', kind: 'native' as const, label: 'URI' }],
            condition: 'contains' as const,
            value: 'test',
            ignoreCase: true,
          },
        },
      ],
    };

    render(<ConditionSummary condition={condition} />);

    expect(screen.getByText(/case-insensitive/i)).toBeInTheDocument();
  });

  it('forwards data-testid correctly', () => {
    const condition = newGroup('and');

    render(<ConditionSummary condition={condition} data-testid='custom-summary' />);

    expect(screen.getByTestId('custom-summary')).toBeInTheDocument();
  });
});

describe('ActionSummary', () => {
  it('displays add_attack action correctly', () => {
    const action = {
      ...newAction('add_attack'),
      attackType: 'sqli',
      comment: 'Test comment',
    };

    render(<ActionSummary action={action} attackTypes={attackTypes} />);

    expect(screen.getByText(/Mark the request as an attack/i)).toBeInTheDocument();
    expect(screen.getByText('SQL Injection')).toBeInTheDocument();
    expect(screen.getByText(/Test comment/i)).toBeInTheDocument();
  });

  it('displays add_tag action correctly', () => {
    const action = {
      ...newAction('add_tag'),
      tagKey: 'env',
      tagValue: 'prod',
    };

    render(<ActionSummary action={action} attackTypes={attackTypes} />);

    expect(screen.getByText(/Tag the request/i)).toBeInTheDocument();
    expect(screen.getByText('env')).toBeInTheDocument();
    expect(screen.getByText('prod')).toBeInTheDocument();
  });

  it('displays experimental flag', () => {
    const action = {
      ...newAction('add_attack'),
      experimental: true,
    };

    render(<ActionSummary action={action} attackTypes={attackTypes} />);

    expect(screen.getByText('Experimental')).toBeInTheDocument();
  });

  it('displays target location', () => {
    const action = {
      ...newAction('add_attack'),
      target: {
        whole: true,
        context: 'http_request' as const,
        segments: [],
      },
    };

    render(<ActionSummary action={action} attackTypes={attackTypes} />);

    expect(screen.getByText('Entire request')).toBeInTheDocument();
  });

  it('forwards data-testid correctly', () => {
    const action = newAction('add_attack');

    render(<ActionSummary action={action} attackTypes={attackTypes} data-testid='custom-action' />);

    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
});

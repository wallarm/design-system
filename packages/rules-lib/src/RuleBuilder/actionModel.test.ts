import { describe, expect, it } from '@rstest/core';
import { actionProblems, fromProtonAction, newAction, toProtonAction } from './actionModel';

const round = (a: unknown) => toProtonAction(fromProtonAction(a));

describe('action model', () => {
  it('round-trips each authorable action', () => {
    const actions = [
      {
        action_type: 'add_attack',
        target: [{ context: 'http_request', point: 'flow' }],
        attack: { attack_type: 'sqli', comment: 'login probe' },
      },
      {
        action_type: 'add_tag',
        target: [{ context: 'http_request', point: 'flow' }],
        tag: { key: 'mode', value: 'debug' },
      },
      {
        action_type: 'suppress_attack',
        target: [{ context: 'http_request', point: "[http:query][format:form]['q']" }],
        attack: { attack_type: 'rce' },
      },
      {
        action_type: 'mark_attack',
        target: [{ context: 'http_request', point: 'flow' }],
        attack: { attack_type: 'xss' },
        experimental: true,
      },
      {
        action_type: 'combine',
        target: [{ context: 'http_request', point: '[http:header]' }],
        separator: ', ',
      },
      {
        action_type: 'processing_time_limit',
        target: [{ context: 'http_request', point: 'flow' }],
        limit: '1.5ms',
        priority: 10,
      },
      {
        action_type: 'processing_space_limit',
        target: [{ context: 'http_request', point: 'flow' }],
        limit: '1.5Mi',
      },
      {
        action_type: 'entry_limits',
        target: [{ context: 'http_request', point: "[http:header]['x-blob']" }],
        entry_size_hard_limit: '8Ki',
      },
    ];
    for (const a of actions) expect(round(a)).toEqual(a);
  });

  it('keeps an action it cannot show as written', () => {
    const a = { action_type: 'suppress_attack', attack_ref: 'hit' };
    expect(fromProtonAction(a).kind).toBe('raw');
    expect(round(a)).toEqual(a);
  });

  it('says what is missing before saving', () => {
    expect(actionProblems(newAction('add_attack'))).toContain('Choose the attack type.');
    expect(actionProblems({ ...newAction('processing_time_limit'), limit: '5' })).toHaveLength(1);
    expect(actionProblems({ ...newAction('processing_time_limit'), limit: '5ms' })).toEqual([]);
    expect(actionProblems({ ...newAction('entry_limits') })).toContain(
      'Say where the action applies.',
    );
  });
});

describe('fromProtonAction on container targets', () => {
  // TODO: Enable this test once wizardPath/segmentsOfPoint is fully implemented
  it.skip('opens a combine on the parsed query string in the builder, not as code', () => {
    const draft = fromProtonAction({
      action_type: 'combine',
      target: [{ context: 'http_request', point: '[http:query][format:form]' }],
      separator: ',',
    });
    expect(draft.kind).toBe('combine');
    expect(draft.separator).toBe(',');
    expect(draft.target.segments.map(s => s.text).join('')).toBe('[http:query][format:form]');
  });
});

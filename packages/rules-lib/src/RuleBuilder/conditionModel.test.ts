import { describe, expect, it } from '@rstest/core';
import { fromProtonCondition, toProtonCondition } from './conditionModel';

const round = (condition: unknown) => toProtonCondition(fromProtonCondition(condition));

describe('condition model', () => {
  it('round-trips checks the wizard can open, nested groups and attack / signal checks', () => {
    const condition = {
      operator: 'and',
      checks: [
        { type: 'equal', context: 'http_request', point: '[http:path]', value: '/login' },
        {
          operator: 'or',
          checks: [
            {
              type: 'contains',
              context: 'http_request',
              point: "[http:header]['user-agent']",
              value: 'curl',
              case_sensitive: false,
            },
            { type: 'exists', context: 'http_request', point: "[http:body][format:json]['user']" },
          ],
        },
        {
          type: 'attack_present',
          context: 'http_request',
          point: 'flow',
          attack: { attack_type: 'sqli' },
        },
        {
          type: 'signal_present',
          context: 'http_request',
          point: '[http:header]',
          signal: { signal_type: 'key_duplicate' },
        },
        {
          type: 'signal_present',
          context: 'http_request',
          point: 'flow',
          signal: { signal_type: 'resource_overlimit', limit: 'processing_time_limit' },
        },
      ],
    };
    expect(round(condition)).toEqual(condition);
  });

  it('keeps a bound attack check as code', () => {
    const condition = {
      operator: 'and',
      checks: [
        {
          type: 'attack_present',
          bind_attack: 'hit',
          context: 'http_request',
          point: 'flow',
          attack: { source: 'stamp' },
        },
      ],
    };
    expect(fromProtonCondition(condition).children[0]?.kind).toBe('raw');
    expect(round(condition)).toEqual(condition);
  });

  it('keeps a check the wizard cannot open as it is', () => {
    const condition = {
      operator: 'and',
      checks: [
        {
          type: 'equal',
          context: 'http_request',
          point: ['[http:path]', '[http:url]'],
          value: 'x',
        },
      ],
    };
    const tree = fromProtonCondition(condition);
    expect(tree.children[0]?.kind).toBe('raw');
    expect(round(condition)).toEqual(condition);
  });

  it('writes "none of" several conditions as not(or(…)) and reads it back', () => {
    const condition = {
      operator: 'not',
      checks: [
        {
          operator: 'or',
          checks: [
            { type: 'equal', context: 'http_request', point: '[http:method]', value: 'GET' },
            { type: 'equal', context: 'http_request', point: '[http:method]', value: 'HEAD' },
          ],
        },
      ],
    };
    const tree = fromProtonCondition(condition);
    expect(tree.operator).toBe('not');
    expect(tree.children).toHaveLength(2);
    expect(round(condition)).toEqual(condition);
  });

  it('is null when nothing is set: the rule applies to every request', () => {
    expect(round(null)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { isFilterParseError, parseExpression } from '../lib/parseExpression';
import { serializeExpression } from '../lib/serializeExpression';
import type { FieldMetadata } from '../types';

const fields: FieldMetadata[] = [
  { name: 'attack_type', label: 'Attack Type', type: 'string' },
  { name: 'host', label: 'Host', type: 'string' },
  { name: 'status_code', label: 'Status Code', type: 'integer' },
  { name: 'country', label: 'Country', type: 'string' },
  { name: 'ip', label: 'IP', type: 'string' },
  { name: 'payload', label: 'Payload', type: 'string' },
  { name: 'date', label: 'Date', type: 'date' },
  {
    name: 'method',
    label: 'Method',
    type: 'enum',
    operators: ['=', '!=', 'in', 'not_in'],
  },
];

describe('parseExpression', () => {
  it('parses single condition', () => {
    const expr = parseExpression('(attack_type = sqli)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'attack_type',
      operator: '=',
      value: 'sqli',
    });
  });

  it('parses not equals', () => {
    const expr = parseExpression('(host != staging.example.com)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'host',
      operator: '!=',
      value: 'staging.example.com',
    });
  });

  it('parses multi-value in', () => {
    const expr = parseExpression('(status_code in [200, 404])', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'status_code',
      operator: 'in',
      value: ['200', '404'],
    });
  });

  it('parses not_in', () => {
    const expr = parseExpression('(country not_in [CN, RU])', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'country',
      operator: 'not_in',
      value: ['CN', 'RU'],
    });
  });

  it('parses is_null', () => {
    const expr = parseExpression('(host is_null)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'host',
      operator: 'is_null',
      value: null,
    });
  });

  it('parses is_not_null', () => {
    const expr = parseExpression('(host is_not_null)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'host',
      operator: 'is_not_null',
      value: null,
    });
  });

  it('parses AND expression', () => {
    const expr = parseExpression('(attack_type = sqli) AND (host = example.com)', fields);
    expect(expr).toEqual({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'attack_type', operator: '=', value: 'sqli' },
        { type: 'condition', field: 'host', operator: '=', value: 'example.com' },
      ],
    });
  });

  it('parses OR expression', () => {
    const expr = parseExpression('(attack_type = sqli) OR (attack_type = xss)', fields);
    expect(expr).toEqual({
      type: 'group',
      operator: 'or',
      children: [
        { type: 'condition', field: 'attack_type', operator: '=', value: 'sqli' },
        { type: 'condition', field: 'attack_type', operator: '=', value: 'xss' },
      ],
    });
  });

  it('AND has higher precedence than OR', () => {
    const expr = parseExpression('(attack_type = sqli) AND (host = a) OR (country = US)', fields);
    expect(expr).toEqual({
      type: 'group',
      operator: 'or',
      children: [
        {
          type: 'group',
          operator: 'and',
          children: [
            { type: 'condition', field: 'attack_type', operator: '=', value: 'sqli' },
            { type: 'condition', field: 'host', operator: '=', value: 'a' },
          ],
        },
        { type: 'condition', field: 'country', operator: '=', value: 'US' },
      ],
    });
  });

  it('handles extra whitespace', () => {
    const expr = parseExpression('  ( attack_type  =  sqli )  ', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'attack_type',
      operator: '=',
      value: 'sqli',
    });
  });

  it('throws on unknown field', () => {
    const expectParseError = (fn: () => void, messagePart?: string) => {
      try {
        fn();
        expect.unreachable('Expected to throw');
      } catch (err) {
        expect(isFilterParseError(err)).toBe(true);
        if (messagePart) expect((err as { message: string }).message).toContain(messagePart);
      }
    };

    expectParseError(() => parseExpression('(unknown_field = value)', fields), 'Unknown field');
  });

  it('throws on unknown operator', () => {
    expect(() => parseExpression('(attack_type CONTAINS value)', fields)).toThrow();
  });

  it('throws on invalid text', () => {
    expect(() => parseExpression('hello world', fields)).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => parseExpression('', fields)).toThrow();
    expect(() => parseExpression('   ', fields)).toThrow();
  });

  it('throws when operator not allowed for field', () => {
    try {
      parseExpression('(method like GET)', fields);
      expect.unreachable('Expected to throw');
    } catch (err) {
      expect(isFilterParseError(err)).toBe(true);
      expect((err as { message: string }).message).toContain('not allowed');
    }
  });

  it('round-trip: serialize → parse → serialize', () => {
    const original = '(attack_type in [sqli, xss]) AND (host != staging.example.com)';
    const parsed = parseExpression(original, fields);
    const reserialized = serializeExpression(parsed);
    const reparsed = parseExpression(reserialized, fields);
    expect(serializeExpression(reparsed)).toBe(reserialized);
  });

  it('case-insensitive AND/OR', () => {
    const expr = parseExpression('(attack_type = sqli) and (host = a)', fields);
    expect(expr.type).toBe('group');
  });
});

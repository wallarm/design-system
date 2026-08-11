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
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    operators: ['=', '!=', 'in'],
    values: [
      { value: 'registered', label: 'Registered' },
      { value: 'blocked', label: 'Blocked' },
      { value: 'active', label: 'Active' },
    ],
  },
  {
    name: 'protocol',
    label: 'Protocol',
    type: 'string',
    options: ['HTTP', 'HTTPS', 'WS', 'WSS'],
  },
  {
    name: 'tag',
    label: 'Tag',
    type: 'string',
    options: [],
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
    const original = '(attack_type in ["sqli", "xss"]) AND (host != "staging.example.com")';
    const parsed = parseExpression(original, fields);
    const reserialized = serializeExpression(parsed);
    const reparsed = parseExpression(reserialized, fields);
    expect(serializeExpression(reparsed)).toBe(reserialized);
  });

  it('case-insensitive AND/OR', () => {
    const expr = parseExpression('(attack_type = sqli) and (host = a)', fields);
    expect(expr.type).toBe('group');
  });

  // ── Value validation ────────────────────────────────────────

  it('accepts valid values for field with values', () => {
    const expr = parseExpression('(status = registered)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'status',
      operator: '=',
      value: 'registered',
    });
  });

  it('throws on invalid single value for field with values', () => {
    try {
      parseExpression('(status = fdf)', fields);
      expect.unreachable('Expected to throw');
    } catch (err) {
      expect(isFilterParseError(err)).toBe(true);
      expect((err as { message: string }).message).toContain('"fdf"');
      expect((err as { message: string }).message).toContain('status');
    }
  });

  it('throws on invalid value in multi-value list', () => {
    try {
      parseExpression('(status in [registered, fdf])', fields);
      expect.unreachable('Expected to throw');
    } catch (err) {
      expect(isFilterParseError(err)).toBe(true);
      expect((err as { message: string }).message).toContain('"fdf"');
    }
  });

  it('throws on multiple invalid values', () => {
    try {
      parseExpression('(status in [registered, fdf, xyz])', fields);
      expect.unreachable('Expected to throw');
    } catch (err) {
      expect(isFilterParseError(err)).toBe(true);
      expect((err as { message: string }).message).toContain('"fdf"');
      expect((err as { message: string }).message).toContain('"xyz"');
    }
  });

  it('accepts valid values for field with options', () => {
    const expr = parseExpression('(protocol = HTTPS)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'protocol',
      operator: '=',
      value: 'HTTPS',
    });
  });

  it('throws on invalid value for field with options', () => {
    try {
      parseExpression('(protocol = FTP)', fields);
      expect.unreachable('Expected to throw');
    } catch (err) {
      expect(isFilterParseError(err)).toBe(true);
      expect((err as { message: string }).message).toContain('"FTP"');
    }
  });

  it('allows any value for field with empty options (freeform)', () => {
    const expr = parseExpression('(tag = anything_goes)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'tag',
      operator: '=',
      value: 'anything_goes',
    });
  });

  it('allows any value for field without values or options', () => {
    const expr = parseExpression('(host = any.host.com)', fields);
    expect(expr).toEqual({
      type: 'condition',
      field: 'host',
      operator: '=',
      value: 'any.host.com',
    });
  });

  // ── AS-1377: paste must validate values the same way typing does ──
  //
  // Copy/paste re-parses the copied `where` string through validateValues.
  // These fields mirror how consumers configure grouped and freeform fields;
  // before the fix, pasting any of them threw "Invalid value ...".
  describe('grouped and freeform values (AS-1377)', () => {
    const groupedFields: FieldMetadata[] = [
      {
        // Strict allowlist expressed as grouped sections: the committable
        // values live in `children`, the top-level entries are section headers
        // with no `value` of their own.
        name: 'attack_type',
        label: 'Attack Type',
        type: 'string',
        values: [
          { label: 'Injection', children: [{ value: 'sqli', label: 'SQLI' }] },
          { label: 'Scripting', children: [{ value: 'xss', label: 'XSS' }] },
        ],
      },
      {
        // Same grouped options, but freeform — the list is a hint, not an
        // allowlist.
        name: 'tag',
        label: 'Tag',
        type: 'string',
        strictValues: false,
        values: [{ label: 'Common', children: [{ value: 'suggested', label: 'Suggested' }] }],
      },
    ];

    it('accepts a grouped leaf value on paste', () => {
      const expr = parseExpression('(attack_type = "sqli")', groupedFields);
      expect(expr).toEqual({
        type: 'condition',
        field: 'attack_type',
        operator: '=',
        value: 'sqli',
      });
    });

    it('accepts multiple grouped leaf values in an in-list on paste', () => {
      const expr = parseExpression('(attack_type in ["sqli", "xss"])', groupedFields);
      expect(expr).toEqual({
        type: 'condition',
        field: 'attack_type',
        operator: 'in',
        value: ['sqli', 'xss'],
      });
    });

    it('still rejects a value absent from a grouped strict allowlist', () => {
      try {
        parseExpression('(attack_type = "nope")', groupedFields);
        expect.unreachable('Expected to throw');
      } catch (err) {
        expect(isFilterParseError(err)).toBe(true);
        expect((err as { message: string }).message).toContain('"nope"');
      }
    });

    it('accepts a freeform value outside the suggestion list on paste', () => {
      const expr = parseExpression('(tag = "anything-goes")', groupedFields);
      expect(expr).toEqual({
        type: 'condition',
        field: 'tag',
        operator: '=',
        value: 'anything-goes',
      });
    });
  });
});

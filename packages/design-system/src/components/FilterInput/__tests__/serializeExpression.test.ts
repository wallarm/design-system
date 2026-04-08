import { describe, expect, it } from 'vitest';
import { serializeExpression } from '../lib/serializeExpression';
import type { Condition, ExprNode, Group } from '../types';

const cond = (
  field: string,
  operator: string,
  value: string | number | boolean | null | Array<string | number>,
): Condition => ({
  type: 'condition',
  field,
  operator: operator as Condition['operator'],
  value,
});

const group = (op: 'and' | 'or', ...children: ExprNode[]): Group => ({
  type: 'group',
  operator: op,
  children,
});

describe('serializeExpression', () => {
  it('returns empty string for null', () => {
    expect(serializeExpression(null)).toBe('');
  });

  it('serializes single equals condition', () => {
    expect(serializeExpression(cond('attack_type', '=', 'sqli'))).toBe('(attack_type = "sqli")');
  });

  it('serializes not equals', () => {
    expect(serializeExpression(cond('host', '!=', 'staging.example.com'))).toBe(
      '(host != "staging.example.com")',
    );
  });

  it('serializes comparison operators', () => {
    expect(serializeExpression(cond('count', '>', '100'))).toBe('(count > "100")');
    expect(serializeExpression(cond('count', '<', '50'))).toBe('(count < "50")');
    expect(serializeExpression(cond('count', '>=', '10'))).toBe('(count >= "10")');
    expect(serializeExpression(cond('count', '<=', '1000'))).toBe('(count <= "1000")');
  });

  it('serializes like operator', () => {
    expect(serializeExpression(cond('payload', 'like', '*password*'))).toBe(
      '(payload like "*password*")',
    );
  });

  it('serializes not_like operator', () => {
    expect(serializeExpression(cond('payload', 'not_like', '*test*'))).toBe(
      '(payload not_like "*test*")',
    );
  });

  it('serializes multi-value in', () => {
    expect(serializeExpression(cond('status_code', 'in', ['200', '404']))).toBe(
      '(status_code in ["200", "404"])',
    );
  });

  it('serializes multi-value not_in', () => {
    expect(serializeExpression(cond('country', 'not_in', ['CN', 'RU']))).toBe(
      '(country not_in ["CN", "RU"])',
    );
  });

  it('serializes is_null without value', () => {
    expect(serializeExpression(cond('field', 'is_null', null))).toBe('(field is_null)');
  });

  it('serializes is_not_null without value', () => {
    expect(serializeExpression(cond('field', 'is_not_null', null))).toBe('(field is_not_null)');
  });

  it('serializes between with array', () => {
    expect(serializeExpression(cond('date', 'between', ['2024-01-01', '2024-12-31']))).toBe(
      '(date between ["2024-01-01", "2024-12-31"])',
    );
  });

  it('serializes AND group', () => {
    const expr = group('and', cond('a', '=', '1'), cond('b', '=', '2'));
    expect(serializeExpression(expr)).toBe('(a = "1") AND (b = "2")');
  });

  it('serializes OR group', () => {
    const expr = group('or', cond('a', '=', '1'), cond('b', '=', '2'));
    expect(serializeExpression(expr)).toBe('(a = "1") OR (b = "2")');
  });

  it('sorts top-level AND conditions alphabetically', () => {
    const expr = group('and', cond('z_field', '=', '1'), cond('a_field', '=', '2'));
    expect(serializeExpression(expr)).toBe('(a_field = "2") AND (z_field = "1")');
  });

  it('sorts top-level OR conditions alphabetically', () => {
    const expr = group('or', cond('host', '=', 'b'), cond('attack_type', '=', 'sqli'));
    expect(serializeExpression(expr)).toBe('(attack_type = "sqli") OR (host = "b")');
  });

  it('handles mixed AND/OR', () => {
    const expr = group(
      'or',
      group('and', cond('a', '=', '1'), cond('b', '=', '2')),
      cond('c', '=', '3'),
    );
    expect(serializeExpression(expr)).toBe('(a = "1") AND (b = "2") OR (c = "3")');
  });
});

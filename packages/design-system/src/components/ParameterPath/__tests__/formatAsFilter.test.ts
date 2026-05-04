import { describe, expect, it } from 'vitest';
import { parseExpression } from '../../FilterInput/lib/parseExpression';
import type { FieldMetadata } from '../../FilterInput/types';
import { formatAsFilter } from '../formatAsFilter';

describe('formatAsFilter', () => {
  it('emits all three clauses when method, segments, encoding are present', () => {
    expect(
      formatAsFilter({
        method: 'POST',
        segments: ['JSON', 'nginx_config'],
        encoding: 'BASE64',
      }),
    ).toBe('method = "POST" AND parameter = "JSON.nginx_config" AND encoding = "BASE64"');
  });

  it('skips method when omitted (e.g. SOAP/MCP)', () => {
    expect(formatAsFilter({ segments: ['cookie', 'session_id'] })).toBe(
      'parameter = "cookie.session_id"',
    );
  });

  it('skips encoding clause when not present', () => {
    expect(formatAsFilter({ method: 'GET', segments: ['query', 'filter'] })).toBe(
      'method = "GET" AND parameter = "query.filter"',
    );
  });

  it('returns empty string when there is nothing to serialize', () => {
    expect(formatAsFilter({ segments: [] })).toBe('');
  });

  it('produces output that parseExpression accepts (round-trip)', () => {
    const fields: FieldMetadata[] = [
      { name: 'method', type: 'string', label: 'Method' },
      { name: 'parameter', type: 'string', label: 'Parameter' },
      { name: 'encoding', type: 'string', label: 'Encoding' },
    ];

    const text = formatAsFilter({
      method: 'POST',
      segments: ['JSON', 'nginx_config'],
      encoding: 'BASE64',
    });

    expect(() => parseExpression(text, fields)).not.toThrow();
  });
});

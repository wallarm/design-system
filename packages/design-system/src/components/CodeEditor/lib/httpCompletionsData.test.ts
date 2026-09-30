import { describe, expect, it } from 'vitest';
import { HTTP_METHODS } from '../../HttpMethod/constants';
import {
  HTTP_COMPLETION_METHODS,
  HTTP_HEADER_VALUES,
  HTTP_HEADERS,
  HTTP_VERSIONS,
} from './httpCompletionsData';

describe('httpCompletionsData', () => {
  it('extends the DS HTTP_METHODS with CONNECT and TRACE', () => {
    expect(HTTP_COMPLETION_METHODS).toEqual([...HTTP_METHODS, 'CONNECT', 'TRACE']);
  });

  it('offers HTTP/1.1 and HTTP/2', () => {
    expect(HTTP_VERSIONS).toEqual(['HTTP/1.1', 'HTTP/2']);
  });

  it('has about seventy unique headers, each with a description', () => {
    const names = HTTP_HEADERS.map(header => header.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(HTTP_HEADERS.length).toBeGreaterThanOrEqual(70);
    for (const header of HTTP_HEADERS) {
      expect(header.name).toMatch(/^[A-Za-z0-9-]+$/);
      expect(header.description.length).toBeGreaterThan(0);
    }
  });

  it('tags directions and repeatable headers', () => {
    const byName = new Map(HTTP_HEADERS.map(header => [header.name, header]));
    expect(byName.get('Host')?.direction).toBe('request');
    expect(byName.get('Set-Cookie')).toMatchObject({ direction: 'response', repeatable: true });
    expect(byName.get('Content-Type')?.direction).toBe('both');
    expect(byName.get('Content-Type')?.repeatable).toBeUndefined();
  });

  it('keys header values by the lowercased name of a known header', () => {
    const known = new Set(HTTP_HEADERS.map(header => header.name.toLowerCase()));
    for (const key of Object.keys(HTTP_HEADER_VALUES)) {
      expect(key).toBe(key.toLowerCase());
      expect(known.has(key)).toBe(true);
    }
    const contentTypes = (HTTP_HEADER_VALUES['content-type'] ?? []).map(value => value.label);
    expect(contentTypes).toContain('application/json');
    expect(contentTypes).toContain('application/json; charset=utf-8');
  });
});

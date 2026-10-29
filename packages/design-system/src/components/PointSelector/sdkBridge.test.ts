/**
 * SDK Bridge Tests - Segment Constructor Unit Tests
 *
 * Tests SDK-canonical segment constructors to ensure they produce
 * correct segment structures matching the Proton SDK specification.
 *
 * Critical: These constructors must match SDK expectations exactly
 * to maintain backend compatibility.
 */

import { describe, expect, it } from '@rstest/core';
import type { Segment } from '@wallarm-org/rules-lib';
import {
  checkSegmentsDirectly,
  completePoint,
  getNextSegmentOptions,
  sdkAlts,
  sdkCombine,
  sdkSeg,
} from './sdkBridge';

describe('sdkBridge segment constructors', () => {
  describe('sdkSeg.native', () => {
    it('creates native segment with value field', () => {
      const seg = sdkSeg.native('body');
      expect(seg).toEqual({ kind: 'native', value: 'body' });
    });

    it('handles different native words', () => {
      expect(sdkSeg.native('header')).toEqual({ kind: 'native', value: 'header' });
      expect(sdkSeg.native('query')).toEqual({ kind: 'native', value: 'query' });
      expect(sdkSeg.native('path')).toEqual({ kind: 'native', value: 'path' });
      expect(sdkSeg.native('url')).toEqual({ kind: 'native', value: 'url' });
      expect(sdkSeg.native('method')).toEqual({ kind: 'native', value: 'method' });
      expect(sdkSeg.native('status')).toEqual({ kind: 'native', value: 'status' });
      expect(sdkSeg.native('proto')).toEqual({ kind: 'native', value: 'proto' });
    });

    it('handles SSE natives', () => {
      expect(sdkSeg.native('data')).toEqual({ kind: 'native', value: 'data' });
      expect(sdkSeg.native('event')).toEqual({ kind: 'native', value: 'event' });
      expect(sdkSeg.native('id')).toEqual({ kind: 'native', value: 'id' });
      expect(sdkSeg.native('retry')).toEqual({ kind: 'native', value: 'retry' });
    });

    it('handles gRPC natives', () => {
      expect(sdkSeg.native('service')).toEqual({ kind: 'native', value: 'service' });
      expect(sdkSeg.native('metadata')).toEqual({ kind: 'native', value: 'metadata' });
    });
  });

  describe('sdkSeg.key', () => {
    it('creates key segment with value field', () => {
      const seg = sdkSeg.key('user');
      expect(seg).toEqual({ kind: 'key', value: 'user' });
    });

    it('handles various key values', () => {
      expect(sdkSeg.key('email')).toEqual({ kind: 'key', value: 'email' });
      expect(sdkSeg.key('authorization')).toEqual({ kind: 'key', value: 'authorization' });
      expect(sdkSeg.key('id')).toEqual({ kind: 'key', value: 'id' });
    });

    it('handles empty key value', () => {
      expect(sdkSeg.key('')).toEqual({ kind: 'key', value: '' });
    });

    it('handles keys with special characters', () => {
      expect(sdkSeg.key('x-api-key')).toEqual({ kind: 'key', value: 'x-api-key' });
      expect(sdkSeg.key('user_id')).toEqual({ kind: 'key', value: 'user_id' });
      expect(sdkSeg.key('content-type')).toEqual({ kind: 'key', value: 'content-type' });
    });
  });

  describe('sdkSeg.name', () => {
    it('creates key segment with role:name', () => {
      const seg = sdkSeg.name('user');
      expect(seg).toEqual({ kind: 'key', value: 'user', role: 'name' });
    });

    it('adds role field to distinguish from plain key', () => {
      const key = sdkSeg.key('id');
      const name = sdkSeg.name('id');
      expect(key).toEqual({ kind: 'key', value: 'id' });
      expect(name).toEqual({ kind: 'key', value: 'id', role: 'name' });
    });

    it('handles various name values', () => {
      expect(sdkSeg.name('email')).toEqual({ kind: 'key', value: 'email', role: 'name' });
      expect(sdkSeg.name('token')).toEqual({ kind: 'key', value: 'token', role: 'name' });
    });
  });

  describe('sdkSeg.attr', () => {
    it('creates typed segment with value field', () => {
      const seg = sdkSeg.attr('@id');
      expect(seg).toEqual({ kind: 'typed', value: '@id' });
    });

    it('handles various XML attributes', () => {
      expect(sdkSeg.attr('@class')).toEqual({ kind: 'typed', value: '@class' });
      expect(sdkSeg.attr('@type')).toEqual({ kind: 'typed', value: '@type' });
      expect(sdkSeg.attr('@xmlns')).toEqual({ kind: 'typed', value: '@xmlns' });
    });

    it('preserves @ prefix in value', () => {
      const seg = sdkSeg.attr('@custom-attr');
      expect(seg.value).toBe('@custom-attr');
    });
  });

  describe('sdkSeg.attrName', () => {
    it('creates typed_name segment with value field', () => {
      const seg = sdkSeg.attrName('@id');
      expect(seg).toEqual({ kind: 'typed_name', value: '@id' });
    });

    it('uses typed_name kind not typed with role', () => {
      const attr = sdkSeg.attr('@id');
      const attrName = sdkSeg.attrName('@id');
      expect(attr).toEqual({ kind: 'typed', value: '@id' });
      expect(attrName).toEqual({ kind: 'typed_name', value: '@id' });
    });

    it('handles various attribute names', () => {
      expect(sdkSeg.attrName('@class')).toEqual({ kind: 'typed_name', value: '@class' });
      expect(sdkSeg.attrName('@xmlns')).toEqual({ kind: 'typed_name', value: '@xmlns' });
    });
  });

  describe('sdkSeg.format', () => {
    it('creates content segment with name field', () => {
      const seg = sdkSeg.format('json');
      expect(seg).toEqual({ kind: 'content', name: 'json' });
    });

    it('uses name field not value', () => {
      const seg = sdkSeg.format('xml');
      expect(seg).toHaveProperty('name');
      expect(seg).not.toHaveProperty('value');
      expect(seg).toEqual({ kind: 'content', name: 'xml' });
    });

    it('handles various format types', () => {
      expect(sdkSeg.format('json')).toEqual({ kind: 'content', name: 'json' });
      expect(sdkSeg.format('xml')).toEqual({ kind: 'content', name: 'xml' });
      expect(sdkSeg.format('form')).toEqual({ kind: 'content', name: 'form' });
      expect(sdkSeg.format('jwt')).toEqual({ kind: 'content', name: 'jwt' });
      expect(sdkSeg.format('protobuf')).toEqual({ kind: 'content', name: 'protobuf' });
      expect(sdkSeg.format('mcp')).toEqual({ kind: 'content', name: 'mcp' });
    });
  });

  describe('sdkSeg.encoding', () => {
    it('creates content segment with name field', () => {
      const seg = sdkSeg.encoding('base64');
      expect(seg).toEqual({ kind: 'content', name: 'base64' });
    });

    it('uses same structure as format', () => {
      const format = sdkSeg.format('json');
      const encoding = sdkSeg.encoding('base64');
      expect(format.kind).toBe('content');
      expect(encoding.kind).toBe('content');
      expect(format).toHaveProperty('name');
      expect(encoding).toHaveProperty('name');
    });

    it('handles various encoding types', () => {
      expect(sdkSeg.encoding('base64')).toEqual({ kind: 'content', name: 'base64' });
      expect(sdkSeg.encoding('gzip')).toEqual({ kind: 'content', name: 'gzip' });
      expect(sdkSeg.encoding('deflate')).toEqual({ kind: 'content', name: 'deflate' });
      expect(sdkSeg.encoding('brotli')).toEqual({ kind: 'content', name: 'brotli' });
    });
  });

  describe('sdkSeg.index', () => {
    it('creates index segment with index field', () => {
      const seg = sdkSeg.index(3);
      expect(seg).toEqual({ kind: 'index', index: 3 });
    });

    it('uses index field not value', () => {
      const seg = sdkSeg.index(0);
      expect(seg).toHaveProperty('index');
      expect(seg).not.toHaveProperty('value');
      expect(seg).toEqual({ kind: 'index', index: 0 });
    });

    it('handles zero index', () => {
      expect(sdkSeg.index(0)).toEqual({ kind: 'index', index: 0 });
    });

    it('handles positive indices', () => {
      expect(sdkSeg.index(1)).toEqual({ kind: 'index', index: 1 });
      expect(sdkSeg.index(5)).toEqual({ kind: 'index', index: 5 });
      expect(sdkSeg.index(42)).toEqual({ kind: 'index', index: 42 });
      expect(sdkSeg.index(100)).toEqual({ kind: 'index', index: 100 });
    });

    it('handles negative indices', () => {
      expect(sdkSeg.index(-1)).toEqual({ kind: 'index', index: -1 });
      expect(sdkSeg.index(-5)).toEqual({ kind: 'index', index: -5 });
    });
  });

  describe('sdkSeg.dup', () => {
    it('creates dup_index segment with ord field', () => {
      const seg = sdkSeg.dup(0);
      expect(seg).toEqual({ kind: 'dup_index', ord: 0 });
    });

    it('uses ord field not value or index', () => {
      const seg = sdkSeg.dup(1);
      expect(seg).toHaveProperty('ord');
      expect(seg).not.toHaveProperty('value');
      expect(seg).not.toHaveProperty('index');
      expect(seg).toEqual({ kind: 'dup_index', ord: 1 });
    });

    it('handles zero ordinal', () => {
      expect(sdkSeg.dup(0)).toEqual({ kind: 'dup_index', ord: 0 });
    });

    it('handles positive ordinals', () => {
      expect(sdkSeg.dup(1)).toEqual({ kind: 'dup_index', ord: 1 });
      expect(sdkSeg.dup(2)).toEqual({ kind: 'dup_index', ord: 2 });
      expect(sdkSeg.dup(10)).toEqual({ kind: 'dup_index', ord: 10 });
    });

    it('handles negative ordinals', () => {
      expect(sdkSeg.dup(-1)).toEqual({ kind: 'dup_index', ord: -1 });
      expect(sdkSeg.dup(-2)).toEqual({ kind: 'dup_index', ord: -2 });
    });
  });

  describe('sdkSeg.dupAll', () => {
    it('creates dup_all segment with no additional fields', () => {
      const seg = sdkSeg.dupAll();
      expect(seg).toEqual({ kind: 'dup_all' });
    });

    it('has only kind field', () => {
      const seg = sdkSeg.dupAll();
      expect(Object.keys(seg)).toEqual(['kind']);
    });
  });

  describe('sdkSeg.dupAny', () => {
    it('creates dup_any segment with no additional fields', () => {
      const seg = sdkSeg.dupAny();
      expect(seg).toEqual({ kind: 'dup_any' });
    });

    it('has only kind field', () => {
      const seg = sdkSeg.dupAny();
      expect(Object.keys(seg)).toEqual(['kind']);
    });

    it('differs from dupAll', () => {
      const any = sdkSeg.dupAny();
      const all = sdkSeg.dupAll();
      expect(any.kind).toBe('dup_any');
      expect(all.kind).toBe('dup_all');
    });
  });

  describe('sdkSeg.joined', () => {
    it('creates combined_key segment with value and separator', () => {
      const seg = sdkSeg.joined('cookie', ', ');
      expect(seg).toEqual({
        kind: 'combined_key',
        value: 'cookie',
        separator: ', ',
      });
    });

    it('uses value field for key name', () => {
      const seg = sdkSeg.joined('authorization', '; ');
      expect(seg).toHaveProperty('value');
      expect(seg.value).toBe('authorization');
    });

    it('stores separator exactly as provided', () => {
      expect(sdkSeg.joined('key', ', ')).toEqual({
        kind: 'combined_key',
        value: 'key',
        separator: ', ',
      });
      expect(sdkSeg.joined('key', ',')).toEqual({
        kind: 'combined_key',
        value: 'key',
        separator: ',',
      });
      expect(sdkSeg.joined('key', '; ')).toEqual({
        kind: 'combined_key',
        value: 'key',
        separator: '; ',
      });
    });

    it('handles various key and separator combinations', () => {
      expect(sdkSeg.joined('cookie', ', ')).toEqual({
        kind: 'combined_key',
        value: 'cookie',
        separator: ', ',
      });
      expect(sdkSeg.joined('set-cookie', '; ')).toEqual({
        kind: 'combined_key',
        value: 'set-cookie',
        separator: '; ',
      });
    });
  });

  describe('sdkSeg.wild', () => {
    it('creates wildcard segment with kinds, quant, and optional role', () => {
      const seg = sdkSeg.wild(['key'], 'one');
      expect(seg).toEqual({
        kind: 'wildcard',
        kinds: ['key'],
        quant: 'one',
      });
    });

    it('accepts single kind', () => {
      expect(sdkSeg.wild(['key'], 'one')).toEqual({
        kind: 'wildcard',
        kinds: ['key'],
        quant: 'one',
      });
    });

    it('accepts multiple kinds', () => {
      expect(sdkSeg.wild(['key', 'arr'], 'zero_or_more')).toEqual({
        kind: 'wildcard',
        kinds: ['key', 'arr'],
        quant: 'zero_or_more',
      });
    });

    it('handles all quantifier types', () => {
      expect(sdkSeg.wild(['key'], 'one').quant).toBe('one');
      expect(sdkSeg.wild(['key'], 'zero_or_one').quant).toBe('zero_or_one');
      expect(sdkSeg.wild(['key'], 'zero_or_more').quant).toBe('zero_or_more');
      expect(sdkSeg.wild(['key'], 'one_or_more').quant).toBe('one_or_more');
    });

    it('includes role when provided', () => {
      expect(sdkSeg.wild(['key'], 'one', 'name')).toEqual({
        kind: 'wildcard',
        kinds: ['key'],
        quant: 'one',
        role: 'name',
      });
      expect(sdkSeg.wild(['key'], 'one', 'value')).toEqual({
        kind: 'wildcard',
        kinds: ['key'],
        quant: 'one',
        role: 'value',
      });
    });

    it('omits role when not provided', () => {
      const seg = sdkSeg.wild(['key'], 'one');
      expect(seg).not.toHaveProperty('role');
    });

    it('handles complex kind combinations', () => {
      expect(sdkSeg.wild(['key', 'arr', 'index'], 'zero_or_more', 'value')).toEqual({
        kind: 'wildcard',
        kinds: ['key', 'arr', 'index'],
        quant: 'zero_or_more',
        role: 'value',
      });
    });
  });

  describe('sdkSeg.method', () => {
    it('creates method segment with value field', () => {
      const seg = sdkSeg.method('tools/call');
      expect(seg).toEqual({ kind: 'method', value: 'tools/call' });
    });

    it('handles various MCP method paths', () => {
      expect(sdkSeg.method('tools/call')).toEqual({ kind: 'method', value: 'tools/call' });
      expect(sdkSeg.method('prompts/get')).toEqual({ kind: 'method', value: 'prompts/get' });
      expect(sdkSeg.method('resources/read')).toEqual({ kind: 'method', value: 'resources/read' });
    });
  });

  describe('sdkSeg.methodAny', () => {
    it('creates method_any segment with no additional fields', () => {
      const seg = sdkSeg.methodAny();
      expect(seg).toEqual({ kind: 'method_any' });
    });

    it('has only kind field', () => {
      const seg = sdkSeg.methodAny();
      expect(Object.keys(seg)).toEqual(['kind']);
    });
  });

  describe('sdkSeg.methodValue', () => {
    it('creates method_value segment with no additional fields', () => {
      const seg = sdkSeg.methodValue();
      expect(seg).toEqual({ kind: 'method_value' });
    });

    it('has only kind field', () => {
      const seg = sdkSeg.methodValue();
      expect(Object.keys(seg)).toEqual(['kind']);
    });
  });

  describe('sdkAlts', () => {
    it('returns single segment directly when array has one item', () => {
      const seg = sdkSeg.key('user');
      const result = sdkAlts([seg]);
      expect(result).toBe(seg);
      expect(result).toEqual({ kind: 'key', value: 'user' });
    });

    it('creates alts structure for multiple segments', () => {
      const seg1 = sdkSeg.key('user');
      const seg2 = sdkSeg.key('admin');
      const result = sdkAlts([seg1, seg2]);
      expect(result).toEqual({
        kind: 'alts',
        alts: [
          { segment: seg1, caseless: false },
          { segment: seg2, caseless: false },
        ],
      });
    });

    it('wraps each segment with caseless flag', () => {
      const seg1 = sdkSeg.format('json');
      const seg2 = sdkSeg.format('xml');
      const result = sdkAlts([seg1, seg2]);
      expect(result).toHaveProperty('alts');
      if ('alts' in result) {
        expect(result.alts).toHaveLength(2);
        expect(result.alts[0]).toEqual({ segment: seg1, caseless: false });
        expect(result.alts[1]).toEqual({ segment: seg2, caseless: false });
      }
    });

    it('respects caseless flags when provided', () => {
      const seg1 = sdkSeg.key('Authorization');
      const seg2 = sdkSeg.key('Cookie');
      const result = sdkAlts([seg1, seg2], [true, true]);
      expect(result).toEqual({
        kind: 'alts',
        alts: [
          { segment: seg1, caseless: true },
          { segment: seg2, caseless: true },
        ],
      });
    });

    it('handles mixed caseless flags', () => {
      const seg1 = sdkSeg.key('id');
      const seg2 = sdkSeg.key('User-Agent');
      const result = sdkAlts([seg1, seg2], [false, true]);
      expect(result).toEqual({
        kind: 'alts',
        alts: [
          { segment: seg1, caseless: false },
          { segment: seg2, caseless: true },
        ],
      });
    });

    it('defaults to false when caseless array is shorter', () => {
      const seg1 = sdkSeg.key('a');
      const seg2 = sdkSeg.key('b');
      const seg3 = sdkSeg.key('c');
      const result = sdkAlts([seg1, seg2, seg3], [true]);
      expect(result).toEqual({
        kind: 'alts',
        alts: [
          { segment: seg1, caseless: true },
          { segment: seg2, caseless: false },
          { segment: seg3, caseless: false },
        ],
      });
    });

    it('handles three or more segments', () => {
      const segments = [sdkSeg.format('json'), sdkSeg.format('xml'), sdkSeg.format('yaml')];
      const result = sdkAlts(segments);
      expect(result).toHaveProperty('alts');
      if ('alts' in result) {
        expect(result.alts).toHaveLength(3);
      }
    });

    it('works with different segment types', () => {
      const seg1 = sdkSeg.format('json');
      const seg2 = sdkSeg.encoding('base64');
      const result = sdkAlts([seg1, seg2]);
      expect(result).toEqual({
        kind: 'alts',
        alts: [
          { segment: { kind: 'content', name: 'json' }, caseless: false },
          { segment: { kind: 'content', name: 'base64' }, caseless: false },
        ],
      });
    });
  });

  describe('sdkCombine', () => {
    it('throws error for empty names array', () => {
      expect(() => sdkCombine('format', [])).toThrow('names array cannot be empty');
    });

    describe('single name handling', () => {
      it('returns format segment for single format name', () => {
        const result = sdkCombine('format', ['json']);
        expect(result).toEqual({ kind: 'content', name: 'json' });
      });

      it('returns encoding segment for single encoding name', () => {
        const result = sdkCombine('encoding', ['base64']);
        expect(result).toEqual({ kind: 'content', name: 'base64' });
      });

      it('returns key segment for single key name', () => {
        const result = sdkCombine('key', ['user']);
        expect(result).toEqual({ kind: 'key', value: 'user' });
      });

      it('returns attr segment for single attr name', () => {
        const result = sdkCombine('attr', ['@id']);
        expect(result).toEqual({ kind: 'typed', value: '@id' });
      });

      it('defaults to key for unknown kind', () => {
        const result = sdkCombine('unknown', ['value']);
        expect(result).toEqual({ kind: 'key', value: 'value' });
      });
    });

    describe('multiple names handling', () => {
      it('creates alternation for multiple formats', () => {
        const result = sdkCombine('format', ['json', 'xml']);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'content', name: 'json' }, caseless: false },
            { segment: { kind: 'content', name: 'xml' }, caseless: false },
          ],
        });
      });

      it('creates alternation for multiple encodings', () => {
        const result = sdkCombine('encoding', ['base64', 'gzip']);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'content', name: 'base64' }, caseless: false },
            { segment: { kind: 'content', name: 'gzip' }, caseless: false },
          ],
        });
      });

      it('creates alternation for multiple keys', () => {
        const result = sdkCombine('key', ['user', 'admin']);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'key', value: 'user' }, caseless: false },
            { segment: { kind: 'key', value: 'admin' }, caseless: false },
          ],
        });
      });

      it('creates alternation for multiple attrs', () => {
        const result = sdkCombine('attr', ['@id', '@class']);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'typed', value: '@id' }, caseless: false },
            { segment: { kind: 'typed', value: '@class' }, caseless: false },
          ],
        });
      });
    });

    describe('caseless support', () => {
      it('applies caseless flags to key alternation', () => {
        const result = sdkCombine('key', ['Authorization', 'Cookie'], [true, true]);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'key', value: 'Authorization' }, caseless: true },
            { segment: { kind: 'key', value: 'Cookie' }, caseless: true },
          ],
        });
      });

      it('applies mixed caseless flags', () => {
        const result = sdkCombine('key', ['id', 'User-Agent'], [false, true]);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'key', value: 'id' }, caseless: false },
            { segment: { kind: 'key', value: 'User-Agent' }, caseless: true },
          ],
        });
      });

      it('ignores caseless for single name', () => {
        const result = sdkCombine('key', ['user'], [true]);
        // Single segment returned directly, caseless not part of segment structure
        expect(result).toEqual({ kind: 'key', value: 'user' });
      });

      it('defaults caseless to false when not provided', () => {
        const result = sdkCombine('key', ['a', 'b']);
        expect(result).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'key', value: 'a' }, caseless: false },
            { segment: { kind: 'key', value: 'b' }, caseless: false },
          ],
        });
      });
    });

    describe('three or more names', () => {
      it('handles three formats', () => {
        const result = sdkCombine('format', ['json', 'xml', 'yaml']);
        expect(result).toHaveProperty('alts');
        if ('alts' in result) {
          expect(result.alts).toHaveLength(3);
          expect(result.alts[0].segment).toEqual({ kind: 'content', name: 'json' });
          expect(result.alts[1].segment).toEqual({ kind: 'content', name: 'xml' });
          expect(result.alts[2].segment).toEqual({ kind: 'content', name: 'yaml' });
        }
      });

      it('handles four keys with caseless', () => {
        const result = sdkCombine('key', ['a', 'b', 'c', 'd'], [true, false, true, false]);
        expect(result).toHaveProperty('alts');
        if ('alts' in result) {
          expect(result.alts).toHaveLength(4);
          expect(result.alts[0]).toEqual({ segment: { kind: 'key', value: 'a' }, caseless: true });
          expect(result.alts[1]).toEqual({
            segment: { kind: 'key', value: 'b' },
            caseless: false,
          });
          expect(result.alts[2]).toEqual({ segment: { kind: 'key', value: 'c' }, caseless: true });
          expect(result.alts[3]).toEqual({
            segment: { kind: 'key', value: 'd' },
            caseless: false,
          });
        }
      });
    });

    describe('kind fallback behavior', () => {
      it('treats encoding as format (both use content kind)', () => {
        const formatResult = sdkCombine('format', ['json']);
        const encodingResult = sdkCombine('encoding', ['base64']);
        expect(formatResult.kind).toBe('content');
        expect(encodingResult.kind).toBe('content');
      });

      it('defaults unknown kinds to key', () => {
        expect(sdkCombine('unknown', ['value'])).toEqual({ kind: 'key', value: 'value' });
        expect(sdkCombine('custom', ['test'])).toEqual({ kind: 'key', value: 'test' });
      });
    });
  });

  describe('integration: real-world segment construction', () => {
    it('builds http header point segments', () => {
      const segments: Segment[] = [
        sdkSeg.native('header'),
        sdkSeg.key('authorization'),
        sdkSeg.format('jwt'),
        sdkSeg.key('payload'),
        sdkSeg.key('sub'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'header' });
      expect(segments[1]).toEqual({ kind: 'key', value: 'authorization' });
      expect(segments[2]).toEqual({ kind: 'content', name: 'jwt' });
      expect(segments[3]).toEqual({ kind: 'key', value: 'payload' });
      expect(segments[4]).toEqual({ kind: 'key', value: 'sub' });
    });

    it('builds body with format and encoding', () => {
      const segments: Segment[] = [
        sdkSeg.native('body'),
        sdkSeg.format('json'),
        sdkSeg.encoding('gzip'),
        sdkSeg.key('user'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toEqual({ kind: 'content', name: 'json' });
      expect(segments[2]).toEqual({ kind: 'content', name: 'gzip' });
      expect(segments[3]).toEqual({ kind: 'key', value: 'user' });
    });

    it('builds array access with index', () => {
      const segments: Segment[] = [
        sdkSeg.native('body'),
        sdkSeg.format('json'),
        sdkSeg.key('users'),
        sdkSeg.index(0),
        sdkSeg.key('email'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toEqual({ kind: 'content', name: 'json' });
      expect(segments[2]).toEqual({ kind: 'key', value: 'users' });
      expect(segments[3]).toEqual({ kind: 'index', index: 0 });
      expect(segments[4]).toEqual({ kind: 'key', value: 'email' });
    });

    it('builds duplicate access with ordinal', () => {
      const segments: Segment[] = [
        sdkSeg.native('header'),
        sdkSeg.key('set-cookie'),
        sdkSeg.dup(0),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'header' });
      expect(segments[1]).toEqual({ kind: 'key', value: 'set-cookie' });
      expect(segments[2]).toEqual({ kind: 'dup_index', ord: 0 });
    });

    it('builds joined entry', () => {
      const segments: Segment[] = [sdkSeg.native('header'), sdkSeg.joined('cookie', '; ')];

      expect(segments[0]).toEqual({ kind: 'native', value: 'header' });
      expect(segments[1]).toEqual({
        kind: 'combined_key',
        value: 'cookie',
        separator: '; ',
      });
    });

    it('builds wildcard with role', () => {
      const segments: Segment[] = [
        sdkSeg.native('body'),
        sdkSeg.format('json'),
        sdkSeg.wild(['key'], 'zero_or_more', 'value'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toEqual({ kind: 'content', name: 'json' });
      expect(segments[2]).toEqual({
        kind: 'wildcard',
        kinds: ['key'],
        quant: 'zero_or_more',
        role: 'value',
      });
    });

    it('builds format alternation', () => {
      const formatSeg = sdkCombine('format', ['json', 'xml', 'yaml']);
      const segments: Segment[] = [sdkSeg.native('body'), formatSeg];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toHaveProperty('kind', 'alts');
      if ('alts' in segments[1]) {
        expect(segments[1].alts).toHaveLength(3);
      }
    });

    it('builds case-insensitive key alternation', () => {
      const keySeg = sdkCombine('key', ['Authorization', 'Cookie'], [true, true]);
      const segments: Segment[] = [sdkSeg.native('header'), keySeg];

      expect(segments[0]).toEqual({ kind: 'native', value: 'header' });
      expect(segments[1]).toHaveProperty('kind', 'alts');
      if ('alts' in segments[1]) {
        expect(segments[1].alts[0].caseless).toBe(true);
        expect(segments[1].alts[1].caseless).toBe(true);
      }
    });

    it('builds XML attribute access', () => {
      const segments: Segment[] = [
        sdkSeg.native('body'),
        sdkSeg.format('xml'),
        sdkSeg.key('root'),
        sdkSeg.attr('@id'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toEqual({ kind: 'content', name: 'xml' });
      expect(segments[2]).toEqual({ kind: 'key', value: 'root' });
      expect(segments[3]).toEqual({ kind: 'typed', value: '@id' });
    });

    it('builds MCP method access', () => {
      const segments: Segment[] = [
        sdkSeg.native('body'),
        sdkSeg.format('mcp'),
        sdkSeg.method('tools/call'),
        sdkSeg.key('name'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toEqual({ kind: 'content', name: 'mcp' });
      expect(segments[2]).toEqual({ kind: 'method', value: 'tools/call' });
      expect(segments[3]).toEqual({ kind: 'key', value: 'name' });
    });

    it('builds role:name access', () => {
      const segments: Segment[] = [
        sdkSeg.native('header'),
        sdkSeg.key('authorization'),
        sdkSeg.name('scheme'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'header' });
      expect(segments[1]).toEqual({ kind: 'key', value: 'authorization' });
      expect(segments[2]).toEqual({ kind: 'key', value: 'scheme', role: 'name' });
    });

    it('builds attribute name access', () => {
      const segments: Segment[] = [
        sdkSeg.native('body'),
        sdkSeg.format('xml'),
        sdkSeg.key('element'),
        sdkSeg.attrName('@xmlns'),
      ];

      expect(segments[0]).toEqual({ kind: 'native', value: 'body' });
      expect(segments[1]).toEqual({ kind: 'content', name: 'xml' });
      expect(segments[2]).toEqual({ kind: 'key', value: 'element' });
      expect(segments[3]).toEqual({ kind: 'typed_name', value: '@xmlns' });
    });
  });

  describe('profile parameter consistency', () => {
    it('getNextSegmentOptions passes profile to SDK', () => {
      // Mock SDK that captures the profile parameter
      let capturedProfile: string | undefined;
      const mockProton = {
        point: {
          next: (_segs: any, _at: any, options: any) => {
            capturedProfile = options.profile;
            return { items: [], error: null };
          },
        },
      } as any;

      // Call with 'tree' profile
      getNextSegmentOptions(mockProton, [], 'http_request', undefined, 'tree');
      expect(capturedProfile).toBe('tree');

      // Call with 'value' profile
      getNextSegmentOptions(mockProton, [], 'http_request', undefined, 'value');
      expect(capturedProfile).toBe('value');
    });

    it('getNextSegmentOptions defaults to tree when profile not provided', () => {
      let capturedProfile: string | undefined;
      const mockProton = {
        point: {
          next: (_segs: any, _at: any, options: any) => {
            capturedProfile = options.profile;
            return { items: [], error: null };
          },
        },
      } as any;

      // Call without explicit profile
      getNextSegmentOptions(mockProton, [], 'http_request', undefined);
      expect(capturedProfile).toBe('tree');
    });

    it('checkSegmentsDirectly passes profile to SDK', () => {
      let capturedProfile: string | undefined;
      const mockProton = {
        point: {
          checkSegments: (_segs: any, options: any) => {
            capturedProfile = options.profile;
            return { ok: true, canonical: '' };
          },
        },
      } as any;

      // Call with 'tree' profile
      checkSegmentsDirectly(mockProton, [sdkSeg.native('body')], {
        profile: 'tree',
        context: 'http_request',
      });
      expect(capturedProfile).toBe('tree');

      // Call with 'value' profile
      checkSegmentsDirectly(mockProton, [sdkSeg.native('body')], {
        profile: 'value',
        context: 'http_request',
      });
      expect(capturedProfile).toBe('value');
    });

    it('completePoint passes profile to SDK', () => {
      let capturedProfile: string | undefined;
      const mockProton = {
        point: {
          complete: (_point: any, _cursor: any, options: any) => {
            capturedProfile = options.profile;
            return { items: [], error: null };
          },
        },
      } as any;

      // Call with 'tree' profile
      completePoint(mockProton, '[http:', 6, { context: 'http_request', profile: 'tree' });
      expect(capturedProfile).toBe('tree');

      // Call with 'value' profile
      completePoint(mockProton, '[http:', 6, { context: 'http_request', profile: 'value' });
      expect(capturedProfile).toBe('value');
    });
  });

  /**
   * MCP Alias Support Tests
   *
   * Tests for [format:mcp] alias per point-sdk.md:167-203.
   * The MCP alias allows method-based navigation in JSON-RPC messages:
   * - [format:mcp][method:'tools/call'] - specific method
   * - [method:*] - any method wildcard
   * - [method] - method value (bare)
   */
  describe('MCP alias support', () => {
    describe('sdkSeg.method', () => {
      it('creates method segment with value field', () => {
        const seg = sdkSeg.method('tools/call');
        expect(seg).toEqual({ kind: 'method', value: 'tools/call' });
      });

      it('handles various method names', () => {
        expect(sdkSeg.method('tools/call')).toEqual({ kind: 'method', value: 'tools/call' });
        expect(sdkSeg.method('prompts/get')).toEqual({ kind: 'method', value: 'prompts/get' });
        expect(sdkSeg.method('ping')).toEqual({ kind: 'method', value: 'ping' });
      });

      it('handles empty method name', () => {
        expect(sdkSeg.method('')).toEqual({ kind: 'method', value: '' });
      });
    });

    describe('sdkSeg.methodAny', () => {
      it('creates method_any segment', () => {
        const seg = sdkSeg.methodAny();
        expect(seg).toEqual({ kind: 'method_any' });
      });

      it('takes no arguments', () => {
        expect(sdkSeg.methodAny()).toEqual({ kind: 'method_any' });
      });
    });

    describe('sdkSeg.methodValue', () => {
      it('creates method_value segment', () => {
        const seg = sdkSeg.methodValue();
        expect(seg).toEqual({ kind: 'method_value' });
      });

      it('takes no arguments', () => {
        expect(sdkSeg.methodValue()).toEqual({ kind: 'method_value' });
      });
    });

    describe('MCP point construction', () => {
      it('builds basic MCP method point', () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.method('tools/call'),
        ];

        // These segments should represent: [http:body][format:mcp][method:'tools/call']
        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'method', value: 'tools/call' },
        ]);
      });

      it('builds MCP with method wildcard', () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.methodAny(),
        ];

        // [http:body][format:mcp][method:*]
        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'method_any' },
        ]);
      });

      it('builds MCP with bare method value', () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.methodValue(),
        ];

        // [http:body][format:mcp][method]
        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'method_value' },
        ]);
      });

      it('builds MCP with params and duplicate selector', () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.key('params'),
          sdkSeg.dup(0),
          sdkSeg.key('name'),
        ];

        // [http:body][format:mcp]['params'][dup:0]['name']
        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'key', value: 'params' },
          { kind: 'dup_index', ord: 0 },
          { kind: 'key', value: 'name' },
        ]);
      });

      it('builds MCP with method alternation', () => {
        const methods = sdkAlts([sdkSeg.method('tools/call'), sdkSeg.method('prompts/get')]);

        const segments: Segment[] = [sdkSeg.native('body'), sdkSeg.format('mcp'), methods];

        // [http:body][format:mcp][method:'tools/call'|'prompts/get']
        expect(segments[2]).toEqual({
          kind: 'alts',
          alts: [
            { segment: { kind: 'method', value: 'tools/call' }, caseless: false },
            { segment: { kind: 'method', value: 'prompts/get' }, caseless: false },
          ],
        });
      });
    });

    describe('MCP canonical form (from reference-ruleset)', () => {
      it('matches reference point: [http:body][format:mcp][method]', () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.methodValue(),
        ];

        // This should match reference-ruleset.json rule for MCP bare method
        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'method_value' },
        ]);
      });

      it("matches reference point: [http:body][format:mcp][method:'tools/call']", () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.method('tools/call'),
        ];

        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'method', value: 'tools/call' },
        ]);
      });

      it("matches reference point: [http:body][format:mcp]['params'][dup:0]['name']", () => {
        const segments: Segment[] = [
          sdkSeg.native('body'),
          sdkSeg.format('mcp'),
          sdkSeg.key('params'),
          sdkSeg.dup(0),
          sdkSeg.key('name'),
        ];

        expect(segments).toEqual([
          { kind: 'native', value: 'body' },
          { kind: 'content', name: 'mcp' },
          { kind: 'key', value: 'params' },
          { kind: 'dup_index', ord: 0 },
          { kind: 'key', value: 'name' },
        ]);
      });
    });
  });

  /**
   * SDK Version Migration Tests
   *
   * Tests for canonical version migration per point-sdk.md:331-349.
   * When SDK's canonical version changes, stored points must be re-canonicalized.
   *
   * Example migration: canonical v1 → v2
   * - v1: `[*]` (bare wildcard)
   * - v2: `[arr|attr|encoding|format|http|key:*]` (explicit union, sse added)
   */
  describe('SDK version migration', () => {
    it('needsRecanonalization returns true when storedVersion is undefined', () => {
      const { needsRecanonalization } = require('./sdkBridge');
      expect(needsRecanonalization(2, undefined)).toBe(true);
    });

    it('needsRecanonalization returns false when currentVersion is undefined', () => {
      const { needsRecanonalization } = require('./sdkBridge');
      expect(needsRecanonalization(undefined, 1)).toBe(false);
    });

    it('needsRecanonalization returns true when versions differ', () => {
      const { needsRecanonalization } = require('./sdkBridge');
      expect(needsRecanonalization(2, 1)).toBe(true);
    });

    it('needsRecanonalization returns false when versions match', () => {
      const { needsRecanonalization } = require('./sdkBridge');
      expect(needsRecanonalization(2, 2)).toBe(false);
    });

    it('recanonicalizeIfNeeded updates canonical form when version changes', () => {
      const { recanonicalizeIfNeeded } = require('./sdkBridge');

      const mockProton = {
        point: {
          check: (_point: any, _options: any) => ({
            ok: true,
            canonical: '[arr|attr|encoding|format|http|key:*]', // v2 form
            exact: false,
          }),
        },
        version: () => ({ canonical: '2' }),
      } as any;

      const value = {
        canonical: '[*]', // v1 form
        canonicalVersion: 1,
        segments: [sdkSeg.wild(['key'], 'one')],
      };

      const updated = recanonicalizeIfNeeded(mockProton, value, 'http_request');

      expect(updated.canonical).toBe('[arr|attr|encoding|format|http|key:*]');
      expect(updated.canonicalVersion).toBe(2);
    });

    it('recanonicalizeIfNeeded keeps original when version matches', () => {
      const { recanonicalizeIfNeeded } = require('./sdkBridge');

      const mockProton = {
        point: {
          check: () => {
            throw new Error('Should not be called');
          },
        },
        version: () => ({ canonical: '2' }),
      } as any;

      const value = {
        canonical: '[arr|attr|encoding|format|http|key:*]',
        canonicalVersion: 2,
        segments: [],
      };

      const updated = recanonicalizeIfNeeded(mockProton, value, 'http_request');

      expect(updated).toBe(value); // Same reference
    });

    it('recanonicalizeIfNeeded handles re-canonicalization failure gracefully', () => {
      const { recanonicalizeIfNeeded } = require('./sdkBridge');

      const consoleWarnSpy = { calls: [] as any[] };
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => consoleWarnSpy.calls.push(args);

      const mockProton = {
        point: {
          check: () => ({
            ok: false,
            error: {
              message: 'Point became invalid in new version',
              layer: 'grammar',
              code: 'invalid',
              span: [0, 0],
              params: {},
              incomplete: false,
            },
          }),
        },
        version: () => ({ canonical: '2' }),
      } as any;

      const value = {
        canonical: '[old:syntax]',
        canonicalVersion: 1,
        segments: [],
      };

      const updated = recanonicalizeIfNeeded(mockProton, value, 'http_request');

      // Should keep original value and log warning
      expect(updated).toBe(value);
      expect(consoleWarnSpy.calls.length).toBe(1);
      expect(consoleWarnSpy.calls[0][0]).toContain('re-canonicalization failed');

      console.warn = originalWarn;
    });

    it('getVersion returns version info when SDK available', () => {
      const { getVersion } = require('./sdkBridge');

      const mockProton = {
        version: () => ({
          crate: 'proton-new',
          ruleset_format: '0.10.3',
          canonical: '2',
          commit: 'abc123',
        }),
      } as any;

      const version = getVersion(mockProton);

      expect(version).toEqual({
        crate: 'proton-new',
        ruleset_format: '0.10.3',
        canonical: '2',
        commit: 'abc123',
      });
    });

    it('getVersion returns null when SDK not available', () => {
      const { getVersion } = require('./sdkBridge');
      expect(getVersion(null)).toBe(null);
    });

    it('getVersion returns null when version() throws', () => {
      const { getVersion } = require('./sdkBridge');

      const mockProton = {
        version: () => {
          throw new Error('SDK error');
        },
      } as any;

      expect(getVersion(mockProton)).toBe(null);
    });
  });
});

/**
 * Tests for parser vocabulary and static keys provider
 *
 * Parser vocabulary are keys PLANTED BY PARSERS, not from wire data.
 * They should appear in completions even if the keys provider doesn't list them.
 *
 * References:
 * - /packages/docs/parsers/*.md (source of truth)
 * - /packages/docs/point-format.md:90-96 (parser vocabulary concept)
 */

import { describe, expect, it } from '@rstest/core';
import { PARSER_VOCABULARY, STATIC_KEYS, staticKeysProvider } from './staticKeys';

describe('STATIC_KEYS', () => {
  it('provides common HTTP headers', () => {
    const headers = STATIC_KEYS['[http:header]'];
    expect(headers).toContain('authorization');
    expect(headers).toContain('content-type');
    expect(headers).toContain('cookie');
  });

  it('provides common query parameters', () => {
    const query = STATIC_KEYS['[http:query]'];
    expect(query).toContain('id');
    expect(query).toContain('page');
    expect(query).toContain('limit');
  });

  it('provides gRPC metadata keys', () => {
    const metadata = STATIC_KEYS['[grpc:metadata]'];
    expect(metadata).toContain('grpc-timeout');
    expect(metadata).toContain('grpc-status');
  });
});

describe('PARSER_VOCABULARY', () => {
  describe('JWT parser ([format:jwt])', () => {
    it('provides JWT structural keys', () => {
      const jwt = PARSER_VOCABULARY.jwt;
      expect(jwt).toContain('header');
      expect(jwt).toContain('payload');
      expect(jwt).toContain('signature');
      expect(jwt).toContain('prefix');
    });

    it('has all keys documented in jwt-parser.md', () => {
      // From packages/docs/parsers/jwt-parser.md
      const jwt = PARSER_VOCABULARY.jwt;
      expect(jwt).toEqual(['prefix', 'header', 'payload', 'signature']);
    });
  });

  describe('Auth parser ([format:auth])', () => {
    it('provides auth scheme keys', () => {
      const auth = PARSER_VOCABULARY.auth;
      expect(auth).toContain('bearer');
      expect(auth).toContain('basic');
      expect(auth).toContain('digest');
    });

    it('provides Basic auth decomposition keys', () => {
      const auth = PARSER_VOCABULARY.auth;
      expect(auth).toContain('user');
      expect(auth).toContain('pass');
    });

    it('has all keys documented in auth-parser.md', () => {
      // From packages/docs/parsers/auth-parser.md
      const auth = PARSER_VOCABULARY.auth;
      expect(auth).toContain('bearer');
      expect(auth).toContain('basic');
      expect(auth).toContain('digest');
      expect(auth).toContain('user');
      expect(auth).toContain('pass');
    });
  });

  describe('Protobuf parser ([format:protobuf])', () => {
    it('provides protobuf reading keys', () => {
      const protobuf = PARSER_VOCABULARY.protobuf;
      expect(protobuf).toContain('varint');
      expect(protobuf).toContain('i32');
      expect(protobuf).toContain('i64');
    });

    it('has all keys documented in protobuf-parser.md', () => {
      // From packages/docs/parsers/protobuf-parser.md
      const protobuf = PARSER_VOCABULARY.protobuf;
      expect(protobuf).toEqual(['varint', 'i32', 'i64']);
    });
  });

  describe('Parsers without structural keys', () => {
    it('documents that cookie parser has no structural keys', () => {
      // Cookie names come from wire data, not parser vocabulary
      expect(PARSER_VOCABULARY.cookie).toBeUndefined();
    });

    it('documents that JSON parser has no structural keys', () => {
      // JSON keys come from document, not parser vocabulary
      expect(PARSER_VOCABULARY.json).toBeUndefined();
    });

    it('documents that form parser has no structural keys', () => {
      // Form field names come from wire data, not parser vocabulary
      expect(PARSER_VOCABULARY.form).toBeUndefined();
    });

    it('documents that ZIP parser has no structural keys', () => {
      // ZIP member filenames come from archive, not parser vocabulary
      expect(PARSER_VOCABULARY.zip).toBeUndefined();
    });
  });
});

describe('staticKeysProvider', () => {
  describe('static keys (wire data)', () => {
    it('returns HTTP headers for [http:header]', () => {
      const keys = staticKeysProvider('[http:header]');
      expect(keys).toContain('authorization');
      expect(keys).toContain('content-type');
    });

    it('returns query params for [http:query]', () => {
      const keys = staticKeysProvider('[http:query]');
      expect(keys).toContain('id');
      expect(keys).toContain('page');
    });

    it('returns gRPC metadata for [grpc:metadata]', () => {
      const keys = staticKeysProvider('[grpc:metadata]');
      expect(keys).toContain('grpc-timeout');
    });
  });

  describe('parser vocabulary extraction', () => {
    it('returns JWT keys after [format:jwt]', () => {
      const keys = staticKeysProvider('[http:body][format:jwt]');
      expect(keys).toContain('header');
      expect(keys).toContain('payload');
      expect(keys).toContain('signature');
      expect(keys).toContain('prefix');
    });

    it('returns JWT keys in nested context', () => {
      const keys = staticKeysProvider("[http:header]['x-token'][format:jwt]");
      expect(keys).toContain('header');
      expect(keys).toContain('payload');
    });

    it('returns auth keys after [format:auth]', () => {
      const keys = staticKeysProvider("[http:header]['authorization'][format:auth]");
      expect(keys).toContain('bearer');
      expect(keys).toContain('basic');
      expect(keys).toContain('digest');
      expect(keys).toContain('user');
      expect(keys).toContain('pass');
    });

    it('returns protobuf keys after [format:protobuf]', () => {
      const keys = staticKeysProvider('[http:body][format:protobuf]');
      expect(keys).toContain('varint');
      expect(keys).toContain('i32');
      expect(keys).toContain('i64');
    });

    it('returns protobuf keys in nested protobuf', () => {
      const keys = staticKeysProvider('[http:body][format:protobuf][3][format:protobuf]');
      expect(keys).toContain('varint');
      expect(keys).toContain('i32');
      expect(keys).toContain('i64');
    });

    it('handles JWT inside auth bearer', () => {
      // [format:auth]['bearer'][format:jwt] should return JWT keys
      const keys = staticKeysProvider(
        "[http:header]['authorization'][format:auth]['bearer'][format:jwt]",
      );
      expect(keys).toContain('header');
      expect(keys).toContain('payload');
      expect(keys).toContain('signature');
    });
  });

  describe('edge cases', () => {
    it('returns empty array for unknown parent', () => {
      const keys = staticKeysProvider('[unknown:native]');
      expect(keys).toEqual([]);
    });

    it('returns empty array for parser without vocabulary', () => {
      const keys = staticKeysProvider('[http:body][format:json]');
      // JSON has no parser vocabulary - keys come from document
      expect(keys).toEqual([]);
    });

    it('returns empty array for encoding without vocabulary', () => {
      const keys = staticKeysProvider('[http:body][encoding:base64]');
      // base64 has no structural keys
      expect(keys).toEqual([]);
    });

    it('extracts last format marker when multiple present', () => {
      // Should use the LAST format marker
      const keys = staticKeysProvider('[http:body][format:json][encoding:base64][format:jwt]');
      expect(keys).toContain('header');
      expect(keys).toContain('payload');
    });
  });

  describe('real-world point examples', () => {
    it('completes JWT header claims', () => {
      // User typed: [http:body][format:jwt]['header'][encoding:base64][format:json]
      // Next should be JSON keys (no parser vocabulary)
      const keys = staticKeysProvider(
        "[http:body][format:jwt]['header'][encoding:base64][format:json]",
      );
      expect(keys).toEqual([]);
    });

    it('completes JWT payload claims', () => {
      // User typed: [http:body][format:jwt]['payload'][encoding:base64][format:json]
      // Next should be JSON keys (no parser vocabulary)
      const keys = staticKeysProvider(
        "[http:body][format:jwt]['payload'][encoding:base64][format:json]",
      );
      expect(keys).toEqual([]);
    });

    it('completes auth bearer JWT', () => {
      // User typed: [http:header]['authorization'][format:auth]['bearer'][format:jwt]
      // Next should be JWT keys
      const keys = staticKeysProvider(
        "[http:header]['authorization'][format:auth]['bearer'][format:jwt]",
      );
      expect(keys).toContain('header');
      expect(keys).toContain('payload');
    });

    it('completes protobuf field reading', () => {
      // User typed: [http:body][format:protobuf][3][format:protobuf][1]
      // Next should be protobuf readings
      const keys = staticKeysProvider('[http:body][format:protobuf][3][format:protobuf][1]');
      expect(keys).toContain('varint');
      expect(keys).toContain('i32');
      expect(keys).toContain('i64');
    });
  });

  describe('parser vocabulary vs wire data distinction', () => {
    it('does not provide parser vocabulary for cookie names', () => {
      // Cookie names are wire data, not parser vocabulary
      const keys = staticKeysProvider("[http:header]['cookie'][format:cookie]");
      expect(keys).toEqual([]);
    });

    it('does not provide parser vocabulary for multipart names', () => {
      // Multipart part names are wire data, not parser vocabulary
      const keys = staticKeysProvider('[http:body][format:multipart]');
      expect(keys).toEqual([]);
    });

    it('does not provide parser vocabulary for form field names', () => {
      // Form field names are wire data, not parser vocabulary
      const keys = staticKeysProvider('[http:body][format:form]');
      expect(keys).toEqual([]);
    });
  });
});

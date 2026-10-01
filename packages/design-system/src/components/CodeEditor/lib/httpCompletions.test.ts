import { describe, expect, it } from 'vitest';
import type {
  CodeEditorCompletion,
  CodeEditorCompletionContext,
  CodeEditorHttpContext,
} from '../types';
import { httpCompletions } from './httpCompletions';

const WORD = /[\w\-/.:]*$/;

/**
 * Hand-built context: `|` in `doc` marks the cursor. Mirrors what the engine's
 * `buildCompletionContext` produces (startingLineNumber 1).
 */
const contextAt = (
  docWithCursor: string,
  http: CodeEditorHttpContext | undefined,
  explicit = false,
): CodeEditorCompletionContext => {
  const offset = docWithCursor.indexOf('|');
  const value = docWithCursor.replace('|', '');
  const before = value.slice(0, offset);
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineEnd = value.indexOf('\n', offset);
  const line = before.split('\n').length;
  const column = offset - lineStart + 1;
  const wordText = before.slice(lineStart).match(WORD)?.[0] ?? '';
  return {
    value,
    position: { line, column },
    lineText: value.slice(lineStart, lineEnd < 0 ? value.length : lineEnd),
    word: { text: wordText, from: { line, column: column - wordText.length } },
    explicit,
    http,
  };
};

const run = (ctx: CodeEditorCompletionContext): CodeEditorCompletion[] | null => {
  const result = httpCompletions(ctx);
  if (result instanceof Promise) throw new Error('httpCompletions must be synchronous');
  return result;
};

const labels = (ctx: CodeEditorCompletionContext): string[] =>
  (run(ctx) ?? []).map(item => item.label);

const REQUEST = { messageKind: 'request' } as const;
const RESPONSE = { messageKind: 'response' } as const;

describe('httpCompletions', () => {
  it('returns null without an http context and in the body', () => {
    expect(run(contextAt('GE|', undefined, true))).toBeNull();
    expect(
      run(contextAt('GET / HTTP/1.1\n\n{"a|"}', { section: 'body', ...REQUEST }, true)),
    ).toBeNull();
  });

  describe('start line', () => {
    it('offers methods with a trailing space for the first token', () => {
      const items = run(contextAt('PO|', { section: 'start-line', ...REQUEST })) ?? [];
      expect(items).toContainEqual({ label: 'POST', apply: 'POST ', kind: 'method' });
      expect(items.map(item => item.label)).toEqual(
        expect.arrayContaining([
          'GET',
          'PUT',
          'PATCH',
          'DELETE',
          'HEAD',
          'OPTIONS',
          'CONNECT',
          'TRACE',
        ]),
      );
    });

    it('also offers versions for the first token, to start a status line', () => {
      const items = run(contextAt('HT|', { section: 'start-line', ...REQUEST })) ?? [];
      expect(items).toContainEqual({ label: 'HTTP/1.1', apply: 'HTTP/1.1 ', kind: 'keyword' });
    });

    it('needs a typed character or Ctrl-Space on an empty line', () => {
      expect(run(contextAt('|', { section: 'start-line', ...REQUEST }))).toBeNull();
      expect(labels(contextAt('|', { section: 'start-line', ...REQUEST }, true))).toContain('GET');
    });

    it('offers nothing for the target', () => {
      expect(run(contextAt('GET /ap|', { section: 'start-line', ...REQUEST }, true))).toBeNull();
    });

    it('offers versions after the target, unprompted', () => {
      const items = run(contextAt('GET /api |', { section: 'start-line', ...REQUEST })) ?? [];
      expect(items).toEqual([
        { label: 'HTTP/1.1', apply: 'HTTP/1.1', kind: 'keyword' },
        { label: 'HTTP/2', apply: 'HTTP/2', kind: 'keyword' },
      ]);
    });

    it('offers no versions after the status code of a response', () => {
      expect(
        run(contextAt('HTTP/1.1 200 |', { section: 'start-line', ...RESPONSE }, true)),
      ).toBeNull();
    });
  });

  describe('header names', () => {
    it('offers request headers with `Name: ` apply, detail and description', () => {
      const items =
        run(contextAt('GET / HTTP/1.1\nAcc|', { section: 'header-name', ...REQUEST })) ?? [];
      const accept = items.find(item => item.label === 'Accept');
      expect(accept).toMatchObject({ apply: 'Accept: ', kind: 'header', detail: 'request header' });
      expect(accept?.info).toEqual(expect.any(String));
      expect(items.map(item => item.label)).toContain('Content-Type');
      expect(items.map(item => item.label)).not.toContain('Set-Cookie');
    });

    it('offers response headers for a response', () => {
      const names = labels(
        contextAt('HTTP/1.1 200 OK\nSe|', { section: 'header-name', ...RESPONSE }),
      );
      expect(names).toEqual(expect.arrayContaining(['Set-Cookie', 'Server', 'Content-Type']));
      expect(names).not.toContain('Host');
    });

    it('skips non-repeatable headers already present, case-insensitively', () => {
      const names = labels(
        contextAt(
          'GET / HTTP/1.1\nhost: a\nContent-Type: text/plain\n|',
          {
            section: 'header-name',
            ...REQUEST,
          },
          true,
        ),
      );
      expect(names).not.toContain('Host');
      expect(names).not.toContain('Content-Type');
      expect(names).toContain('Accept');
    });

    it('keeps repeatable headers that are already present', () => {
      const names = labels(
        contextAt('HTTP/1.1 200 OK\nSet-Cookie: a=1\nSet|', {
          section: 'header-name',
          ...RESPONSE,
        }),
      );
      expect(names).toContain('Set-Cookie');
    });

    it('does not count the line being typed as present', () => {
      const names = labels(
        contextAt('GET / HTTP/1.1\nHost|', { section: 'header-name', ...REQUEST }),
      );
      expect(names).toContain('Host');
    });

    it('ignores header-looking lines in the body', () => {
      const names = labels(
        contextAt('GET / HTTP/1.1\nAcc|\n\nAccept: x', { section: 'header-name', ...REQUEST }),
      );
      expect(names).toContain('Accept');
    });

    it('offers nothing after a space in a header name, or on an empty line unprompted', () => {
      expect(
        run(contextAt('GET / HTTP/1.1\nX Ho|', { section: 'header-name', ...REQUEST }, true)),
      ).toBeNull();
      expect(
        run(contextAt('GET / HTTP/1.1\n|', { section: 'header-name', ...REQUEST })),
      ).toBeNull();
    });
  });

  describe('header values', () => {
    const valueContext = (doc: string, headerName: string, explicit = false) =>
      contextAt(doc, { section: 'header-value', headerName, ...REQUEST }, explicit);

    it('offers media types for Content-Type right after the colon, unprompted', () => {
      const items = run(valueContext('POST / HTTP/1.1\nContent-Type: |', 'Content-Type')) ?? [];
      expect(items).toContainEqual({ label: 'application/json', kind: 'value' });
      expect(items.map(item => item.label)).toContain('application/json; charset=utf-8');
      expect(items.map(item => item.label)).not.toContain('*/*');
    });

    it('offers */* for Accept and matches the header name case-insensitively', () => {
      expect(labels(valueContext('GET / HTTP/1.1\naccept: ap|', 'accept'))).toEqual(
        expect.arrayContaining(['*/*', 'application/json']),
      );
    });

    it('offers charset after `;` in a media type', () => {
      expect(
        labels(valueContext('POST / HTTP/1.1\nContent-Type: text/plain; |', 'Content-Type')),
      ).toEqual(['charset=utf-8']);
    });

    it('does not re-offer charset after `charset=` or when already present', () => {
      const ct = (doc: string) => valueContext(doc, 'Content-Type', true);
      expect(run(ct('POST / HTTP/1.1\nContent-Type: text/plain; charset=|'))).toBeNull();
      expect(run(ct('POST / HTTP/1.1\nContent-Type: text/plain; charset=utf-8; |'))).toBeNull();
    });

    it('offers Authorization schemes with a trailing space', () => {
      const items = run(valueContext('GET / HTTP/1.1\nAuthorization: Be|', 'Authorization')) ?? [];
      expect(items).toContainEqual(
        expect.objectContaining({ label: 'Bearer', apply: 'Bearer ', kind: 'value' }),
      );
      expect(items.map(item => item.label)).toEqual([
        'Bearer',
        'Basic',
        'Digest',
        'Negotiate',
        'AWS4-HMAC-SHA256',
      ]);
    });

    it('offers Accept-Encoding, Cache-Control and Connection values', () => {
      expect(labels(valueContext('GET / HTTP/1.1\nAccept-Encoding: |', 'Accept-Encoding'))).toEqual(
        expect.arrayContaining(['gzip, deflate, br, zstd', 'gzip', 'br', 'zstd']),
      );
      expect(labels(valueContext('GET / HTTP/1.1\nCache-Control: |', 'Cache-Control'))).toEqual(
        expect.arrayContaining(['no-cache', 'no-store', 'max-age=', 'private', 'public']),
      );
      expect(labels(valueContext('GET / HTTP/1.1\nConnection: |', 'Connection'))).toEqual([
        'keep-alive',
        'close',
      ]);
    });

    it('offers later list items only on Ctrl-Space', () => {
      const doc = 'GET / HTTP/1.1\nAccept-Encoding: gzip, |';
      expect(run(valueContext(doc, 'Accept-Encoding'))).toBeNull();
      expect(labels(valueContext(doc, 'Accept-Encoding', true))).toContain('br');
    });

    it('offers nothing for unknown headers or `Name:value` without a space', () => {
      expect(run(valueContext('GET / HTTP/1.1\nX-Custom: |', 'X-Custom', true))).toBeNull();
      expect(run(valueContext('GET / HTTP/1.1\nConnection:cl|', 'Connection', true))).toBeNull();
    });
  });
});

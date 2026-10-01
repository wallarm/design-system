import { buildParserFile } from '@lezer/generator';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parser } from './parser';

const dir = dirname(fileURLToPath(import.meta.url));
const read = (name: string): string => readFileSync(join(dir, name), 'utf8');
const shape = (doc: string): string => parser.parse(doc).toString();

describe('http.grammar', () => {
  it('committed parser.ts / parser.terms.ts are up to date (run `pnpm generate:grammars`)', () => {
    const built = buildParserFile(read('http.grammar'), {
      fileName: 'http.grammar',
      typeScript: true,
    });
    expect(read('parser.ts')).toBe(built.parser);
    expect(read('parser.terms.ts')).toBe(built.terms);
  });

  it('parses a request line with method, target and version', () => {
    expect(shape('GET /api/users?id=1 HTTP/1.1')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)))',
    );
  });

  it('parses a request line without version and a custom method', () => {
    expect(shape('M-SEARCH *')).toBe('Message(StartLine(RequestLine(Method,Target)))');
  });

  it('parses a status line with and without reason phrase', () => {
    expect(shape('HTTP/1.1 404 Not Found')).toBe(
      'Message(StartLine(StatusLine(Version,StatusCode,ReasonPhrase)))',
    );
    expect(shape('HTTP/2 204')).toBe('Message(StartLine(StatusLine(Version,StatusCode)))');
  });

  it('keeps a StartLine for garbage, lowercase and empty first lines', () => {
    expect(shape('hello world\nA: b')).toBe(
      'Message(StartLine(StartLineText),Header(HeaderName,HeaderValue))',
    );
    expect(shape('get /x HTTP/1.1')).toBe('Message(StartLine(StartLineText))');
    expect(shape('\nA: b')).toBe('Message(StartLine,Header(HeaderName,HeaderValue))');
    expect(shape('')).toBe('Message(StartLine)');
  });

  it('parses headers, including empty values, missing colons and continuation lines', () => {
    expect(shape('GET / HTTP/1.1\nHost: example.com\nX-Empty:\nbroken\n  continued')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),' +
        'Header(HeaderName,HeaderValue),Header(HeaderName),Header(HeaderName),Header(HeaderName))',
    );
  });

  it('has no body without a blank line, or when nothing follows the blank line', () => {
    expect(shape('GET / HTTP/1.1\nHost: x')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),Header(HeaderName,HeaderValue))',
    );
    expect(shape('GET / HTTP/1.1\nHost: x\n')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),Header(HeaderName,HeaderValue))',
    );
    expect(shape('GET / HTTP/1.1\nHost: x\n\n')).toBe(
      'Message(StartLine(RequestLine(Method,Target,Version)),Header(HeaderName,HeaderValue))',
    );
  });

  it('treats a spaces/tabs-only line after line 1 as the blank separator', () => {
    expect(shape('GET /\nA: b\n \t \nbody')).toBe(
      'Message(StartLine(RequestLine(Method,Target)),Header(HeaderName,HeaderValue),BlankLine,Body)',
    );
  });

  it('keeps blank lines inside the body as one Body node reaching the end of the document', () => {
    const doc = 'POST / HTTP/1.1\nA: b\n\nline 1\n\n\nline 4\n';
    const tree = parser.parse(doc);
    const body = tree.topNode.getChild('Body');
    expect(body?.from).toBe(doc.indexOf('line 1'));
    expect(body?.to).toBe(doc.length);
  });

  it('parses without error nodes for typical messages', () => {
    const docs = [
      'POST /api HTTP/1.1\nContent-Type: application/json; charset=utf-8\n\n{"a": 1}',
      'HTTP/1.1 200 OK\nContent-Type: text/plain\n\nhello\n\nworld',
      'GET / HTTP/2\n:authority: example.com\n\n',
    ];
    for (const doc of docs) {
      expect(shape(doc)).not.toContain('⚠');
    }
  });
});

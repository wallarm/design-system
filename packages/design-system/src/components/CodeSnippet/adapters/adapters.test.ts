import { describe, expect, it, rs } from '@rstest/core';
import { highlightJsAdapter } from './highlightjs';
import { plainAdapter } from './plain';
import { prismAdapter } from './prism';

const LUA_CODE = 'local x = "s" -- c\nreturn 42';

const expectLuaTokens = (tokens: { content: string; type: string }[][]) => {
  expect(tokens).toHaveLength(2);
  const all = tokens.flat();
  const typeOf = (content: string) => all.find(t => t.content.trim() === content)?.type;
  expect(typeOf('local')).toBe('keyword');
  expect(typeOf('return')).toBe('keyword');
  expect(all.find(t => t.content.includes('"s"') || t.content === 's')?.type).toBe('string');
  expect(all.find(t => t.content.includes('-- c') || t.content.trim() === 'c')?.type).toBe(
    'comment',
  );
  expect(typeOf('42')).toBe('number');
  expect(all.map(t => t.content).join('')).toBe(LUA_CODE.replace('\n', ''));
};

describe('plainAdapter', () => {
  it('returns one plain token per line', async () => {
    const result = await plainAdapter.highlight('hello\nworld', 'text');

    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual([{ content: 'hello', type: 'plain' }]);
    expect(result.tokens[1]).toEqual([{ content: 'world', type: 'plain' }]);
  });

  it('splits code by newlines correctly', async () => {
    const code = 'line1\nline2\nline3\n';
    const result = await plainAdapter.highlight(code, 'plain');

    // "line1\nline2\nline3\n".split('\n') → ["line1", "line2", "line3", ""]
    expect(result.tokens).toHaveLength(4);
    expect(result.tokens[0]).toEqual([{ content: 'line1', type: 'plain' }]);
    expect(result.tokens[1]).toEqual([{ content: 'line2', type: 'plain' }]);
    expect(result.tokens[2]).toEqual([{ content: 'line3', type: 'plain' }]);
    expect(result.tokens[3]).toEqual([{ content: '', type: 'plain' }]);
  });
});

describe('prismAdapter', () => {
  it('highlights Lua with keyword, string, comment and number tokens', async () => {
    expectLuaTokens((await prismAdapter.highlight(LUA_CODE, 'lua')).tokens);
  });

  it('highlights known language with correct token types', async () => {
    const code = 'const x = 42;';
    const result = await prismAdapter.highlight(code, 'javascript');

    expect(result.tokens).toHaveLength(1);
    const line = result.tokens[0] ?? [];

    // Should contain at least keyword ("const"), plain/variable, operator, number, punctuation
    const types = line.map(t => t.type);
    expect(types).toContain('keyword');
    expect(types).toContain('operator');
    expect(types).toContain('number');
    expect(types).toContain('punctuation');

    // Reconstructed text should match original
    const text = line.map(t => t.content).join('');
    expect(text).toBe(code);
  });

  it('highlights HTTP request with correct token types', async () => {
    const code = 'GET /api/users HTTP/1.1\nHost: api.example.com';
    const result = await prismAdapter.highlight(code, 'http');

    expect(result.tokens).toHaveLength(2);

    // First line should contain function (HTTP method maps to function due to shared Prism type)
    const line1Types = result.tokens[0]?.map(t => t.type) ?? [];
    expect(line1Types).toContain('function');

    // Second line should contain attr-name (header name)
    const line2Types = result.tokens[1]?.map(t => t.type) ?? [];
    expect(line2Types).toContain('attr-name');

    // Reconstructed text should match original
    const text = result.tokens.map(line => line.map(t => t.content).join('')).join('\n');
    expect(text).toBe(code);
  });

  it('handles unknown language gracefully', async () => {
    const code = 'some code';
    // Cast to bypass type checking — simulates unsupported language at runtime
    const result = await prismAdapter.highlight(code, 'nonexistent-lang' as never);

    // Falls back to plain tokens
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0]).toEqual([{ content: 'some code', type: 'plain' }]);
  });

  it('flattens nested tokens', async () => {
    // Template literals produce nested Prism tokens (template-string > interpolation)
    const code = '`hello ${name}`';
    const result = await prismAdapter.highlight(code, 'javascript');

    expect(result.tokens).toHaveLength(1);
    const line = result.tokens[0] ?? [];

    // All tokens should be flat (no nesting) and reconstructed text matches
    for (const token of line) {
      expect(typeof token.content).toBe('string');
      expect(typeof token.type).toBe('string');
    }
    const text = line.map(t => t.content).join('');
    expect(text).toBe(code);
  });
});

describe('shikiAdapter', () => {
  it('highlights Lua with keyword, string, comment and number tokens', async () => {
    const { shikiAdapter } = await import('./shiki');
    expectLuaTokens((await shikiAdapter.highlight(LUA_CODE, 'lua')).tokens);
  });

  it('highlights code with correct token types', async () => {
    const { shikiAdapter } = await import('./shiki');
    const code = 'const x = 42;';
    const result = await shikiAdapter.highlight(code, 'javascript');

    expect(result.tokens).toHaveLength(1);
    const line = result.tokens[0] ?? [];

    // Should have typed tokens, not all plain
    const types = new Set(line.map(t => t.type));
    expect(types.size).toBeGreaterThan(1);

    // Reconstructed text should match original
    const text = line.map(t => t.content).join('');
    expect(text).toBe(code);
  });

  it('highlights HTTP with correct token types', async () => {
    const { shikiAdapter } = await import('./shiki');
    const code = 'GET /api/users HTTP/1.1';
    const result = await shikiAdapter.highlight(code, 'http');

    expect(result.tokens).toHaveLength(1);
    const line = result.tokens[0] ?? [];
    const types = new Set(line.map(t => t.type));
    expect(types.size).toBeGreaterThan(1);

    const text = line.map(t => t.content).join('');
    expect(text).toBe(code);
  });

  it('lazy-loads highlighter on first use', async () => {
    rs.resetModules();

    const createHighlighter = rs.fn().mockResolvedValue({
      codeToTokensBase: () => [[{ content: 'test', explanation: [] }]],
    });
    rs.doMock('shiki', () => ({ createHighlighter }));

    const { shikiAdapter } = await import('./shiki');

    await shikiAdapter.highlight('test', 'javascript');
    await shikiAdapter.highlight('test2', 'typescript');

    // Highlighter created only once despite two highlight calls
    expect(createHighlighter).toHaveBeenCalledTimes(1);

    rs.restoreAllMocks();
  });

  it('falls back to plain tokens on error', async () => {
    rs.resetModules();

    rs.doMock('shiki', () => ({
      createHighlighter: rs.fn().mockRejectedValue(new Error('shiki load failed')),
    }));

    const { shikiAdapter } = await import('./shiki');
    const result = await shikiAdapter.highlight('hello\nworld', 'javascript');

    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual([{ content: 'hello', type: 'plain' }]);
    expect(result.tokens[1]).toEqual([{ content: 'world', type: 'plain' }]);

    rs.restoreAllMocks();
  });
});

describe('highlightJsAdapter', () => {
  it('highlights Lua with keyword, string, comment and number tokens', async () => {
    expectLuaTokens((await highlightJsAdapter.highlight(LUA_CODE, 'lua')).tokens);
  });

  it('highlights code with correct token types', async () => {
    const code = 'const x = 42;';
    const result = await highlightJsAdapter.highlight(code, 'javascript');

    expect(result.tokens).toHaveLength(1);
    const line = result.tokens[0] ?? [];

    // Should have typed tokens, not all plain
    const types = new Set(line.map(t => t.type));
    expect(types.size).toBeGreaterThan(1);

    // Reconstructed text should match original
    const text = line.map(t => t.content).join('');
    expect(text).toBe(code);
  });

  it('highlights HTTP with correct token types', async () => {
    const code = 'GET /api/users HTTP/1.1\nHost: api.example.com';
    const result = await highlightJsAdapter.highlight(code, 'http');

    expect(result.tokens).toHaveLength(2);
    const line1Types = result.tokens[0]?.map(t => t.type) ?? [];
    expect(line1Types).toContain('keyword'); // GET method

    const text = result.tokens.map(line => line.map(t => t.content).join('')).join('\n');
    expect(text).toBe(code);
  });

  it('decodes HTML entities correctly', async () => {
    // Comparison operators produce &lt; and &gt; in hljs HTML output
    const code = 'if (a < b && c > d) {}';
    const result = await highlightJsAdapter.highlight(code, 'javascript');

    // Reconstructed text must match original — entities decoded back to < > &
    const allText = result.tokens
      .flat()
      .map(t => t.content)
      .join('');
    expect(allText).toBe(code);
  });

  it('falls back to plain tokens on error', async () => {
    rs.resetModules();

    rs.doMock('highlight.js', () => ({
      default: {
        highlight: () => {
          throw new Error('hljs failed');
        },
      },
    }));

    const { highlightJsAdapter: adapter } = await import('./highlightjs');
    const result = await adapter.highlight('hello\nworld', 'javascript');

    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual([{ content: 'hello', type: 'plain' }]);
    expect(result.tokens[1]).toEqual([{ content: 'world', type: 'plain' }]);

    rs.restoreAllMocks();
  });
});

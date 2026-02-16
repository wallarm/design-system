import { describe, expect, it, vi } from 'vitest';
import { highlightJsAdapter } from './highlightjs';
import { plainAdapter } from './plain';
import { prismAdapter } from './prism';

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

  it('lazy-loads highlighter on first use', async () => {
    vi.resetModules();

    const createHighlighter = vi.fn().mockResolvedValue({
      codeToTokensBase: () => [[{ content: 'test', explanation: [] }]],
    });
    vi.doMock('shiki', () => ({ createHighlighter }));

    const { shikiAdapter } = await import('./shiki');

    await shikiAdapter.highlight('test', 'javascript');
    await shikiAdapter.highlight('test2', 'typescript');

    // Highlighter created only once despite two highlight calls
    expect(createHighlighter).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it('falls back to plain tokens on error', async () => {
    vi.resetModules();

    vi.doMock('shiki', () => ({
      createHighlighter: vi.fn().mockRejectedValue(new Error('shiki load failed')),
    }));

    const { shikiAdapter } = await import('./shiki');
    const result = await shikiAdapter.highlight('hello\nworld', 'javascript');

    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual([{ content: 'hello', type: 'plain' }]);
    expect(result.tokens[1]).toEqual([{ content: 'world', type: 'plain' }]);

    vi.restoreAllMocks();
  });
});

describe('highlightJsAdapter', () => {
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
    vi.resetModules();

    vi.doMock('highlight.js', () => ({
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

    vi.restoreAllMocks();
  });
});

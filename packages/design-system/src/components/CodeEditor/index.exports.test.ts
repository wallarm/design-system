import { describe, expect, it } from 'vitest';
import * as CodeEditor from './index';
import { httpCompletions } from './lib/httpCompletions';

describe('CodeEditor public exports', () => {
  it('exports the built-in HTTP completion source', () => {
    expect(CodeEditor.httpCompletions).toBe(httpCompletions);
  });
});

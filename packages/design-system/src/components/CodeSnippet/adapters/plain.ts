import type { HighlightResult, PlainLanguage, SyntaxAdapter, Token } from './types';

const SUPPORTED_LANGUAGES = ['text', 'plain'] as const satisfies readonly PlainLanguage[];

export const plainAdapter: SyntaxAdapter<PlainLanguage> = {
  name: 'plain',

  async highlight(code: string): Promise<HighlightResult> {
    const tokens: Token[][] = code.split('\n').map(line => [{ content: line, type: 'plain' }]);
    return { tokens };
  },

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  },
};

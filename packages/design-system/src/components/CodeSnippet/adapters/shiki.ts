import type { HighlighterGeneric, ThemedToken } from '@shikijs/types';
import type { HighlightResult, ShikiLanguage, SyntaxAdapter, Token, TokenType } from './types';

// Lazy-loaded shiki highlighter instance
let highlighterPromise: Promise<HighlighterGeneric<never, never>> | null = null;

const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'bash',
  'shell',
  'json',
  'html',
  'xml',
  'css',
  'python',
  'go',
  'sql',
  'yaml',
  'markdown',
  'rust',
  'java',
  'c',
  'cpp',
] as const satisfies readonly ShikiLanguage[];

/** Map Shiki token scopes to our strict TokenType */
function mapScopeToTokenType(scopes: string[] | undefined): TokenType {
  if (!scopes || scopes.length === 0) return 'plain';

  const scope = scopes.join(' ').toLowerCase();

  // Keywords
  if (scope.includes('keyword') || scope.includes('storage')) return 'keyword';
  // Strings
  if (scope.includes('string')) return 'string';
  // Comments
  if (scope.includes('comment')) return 'comment';
  // Functions
  if (scope.includes('function') || scope.includes('method')) return 'function';
  // Numbers
  if (scope.includes('number') || scope.includes('numeric')) return 'number';
  // Operators
  if (scope.includes('operator')) return 'operator';
  // Punctuation
  if (scope.includes('punctuation') || scope.includes('bracket') || scope.includes('brace'))
    return 'punctuation';
  // Classes
  if (scope.includes('class') || scope.includes('type')) return 'class-name';
  // Properties
  if (scope.includes('property') || scope.includes('attribute.name')) return 'property';
  // Tags (HTML/XML)
  if (scope.includes('tag')) return 'tag';
  // Attribute names
  if (scope.includes('attribute')) return 'attr-name';
  // Booleans
  if (scope.includes('boolean') || scope.includes('constant.language')) return 'boolean';
  // Built-ins
  if (scope.includes('support') || scope.includes('builtin')) return 'builtin';
  // Constants
  if (scope.includes('constant')) return 'constant';
  // Regex
  if (scope.includes('regex') || scope.includes('regexp')) return 'regex';
  // Variables
  if (scope.includes('variable')) return 'variable';

  return 'plain';
}

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(async ({ createHighlighter }) => {
      return createHighlighter({
        themes: ['github-light'],
        langs: [...SUPPORTED_LANGUAGES],
      });
    });
  }
  return highlighterPromise;
}

export const shikiAdapter: SyntaxAdapter<ShikiLanguage> = {
  name: 'shiki',

  async highlight(code: string, language: ShikiLanguage): Promise<HighlightResult> {
    try {
      const highlighter = await getHighlighter();

      // Get tokens using Shiki's tokenization with explanations for scope info
      const themedTokens = highlighter.codeToTokensBase(code, {
        lang: language,
        theme: 'github-light',
        includeExplanation: true,
      });

      const tokens: Token[][] = themedTokens.map((line: ThemedToken[]) =>
        line.map((token: ThemedToken) => ({
          content: token.content,
          type: mapScopeToTokenType(token.explanation?.[0]?.scopes.map(s => s.scopeName)),
        })),
      );

      return { tokens };
    } catch {
      // Fallback to plain text if highlighting fails
      const tokens: Token[][] = code
        .split('\n')
        .map(line => [{ content: line, type: 'plain' as const }]);
      return { tokens };
    }
  },

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  },
};

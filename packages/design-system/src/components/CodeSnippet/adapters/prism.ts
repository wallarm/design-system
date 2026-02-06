import { Prism } from 'prism-react-renderer';

import type {
  HighlightResult,
  PrismLanguage,
  SyntaxAdapter,
  Token,
  TokenType,
} from './types';

// Make Prism available globally so we can load additional languages
// This must be done before importing language components
(typeof globalThis !== 'undefined' ? globalThis : window).Prism = Prism;

// Track if additional languages have been loaded
let languagesLoaded = false;

async function loadAdditionalLanguages() {
  if (languagesLoaded) return;
  languagesLoaded = true;

  // Dynamically import additional languages
  await import('prismjs/components/prism-bash');
}

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
] as const satisfies readonly PrismLanguage[];

/** Map Prism token types to our strict TokenType */
function mapTokenType(prismType: string): TokenType {
  const typeMap: Record<string, TokenType> = {
    plain: 'plain',
    keyword: 'keyword',
    string: 'string',
    comment: 'comment',
    function: 'function',
    number: 'number',
    operator: 'operator',
    punctuation: 'punctuation',
    'class-name': 'class-name',
    property: 'property',
    tag: 'tag',
    'attr-name': 'attr-name',
    'attr-value': 'attr-value',
    boolean: 'boolean',
    builtin: 'builtin',
    constant: 'constant',
    regex: 'regex',
    variable: 'variable',
    // Additional Prism types mapped to our types
    parameter: 'variable',
    'template-string': 'string',
    'template-punctuation': 'punctuation',
    interpolation: 'variable',
    'interpolation-punctuation': 'punctuation',
    module: 'builtin',
    imports: 'keyword',
    exports: 'keyword',
    'maybe-class-name': 'class-name',
    'known-class-name': 'class-name',
    'function-variable': 'function',
    method: 'function',
    'method-variable': 'function',
    'property-access': 'property',
    dom: 'builtin',
    console: 'builtin',
    // Bash-specific types
    'assign-left': 'variable',
    environment: 'variable',
    shebang: 'comment',
    'file-descriptor': 'number',
  };

  return typeMap[prismType] ?? 'plain';
}

type PrismTokenContent = string | PrismToken | PrismToken[];
type PrismToken =
  | string
  | { type: string; content: PrismTokenContent; alias?: string | string[] };

/** Flatten nested Prism tokens into a flat array */
function flattenToken(
  token: PrismToken,
  parentType: string = 'plain',
): Token[] {
  if (typeof token === 'string') {
    return [{ content: token, type: mapTokenType(parentType) }];
  }

  const tokenType = token.type || parentType;
  const content = token.content;

  if (typeof content === 'string') {
    return [{ content, type: mapTokenType(tokenType) }];
  }

  if (Array.isArray(content)) {
    // Handle array of strings or tokens
    return content.flatMap((item) => {
      if (typeof item === 'string') {
        return [{ content: item, type: mapTokenType(tokenType) }];
      }
      return flattenToken(item, tokenType);
    });
  }

  // Content is a nested token object
  return flattenToken(content, tokenType);
}

export const prismAdapter: SyntaxAdapter<PrismLanguage> = {
  name: 'prism',

  async highlight(
    code: string,
    language: PrismLanguage,
  ): Promise<HighlightResult> {
    // Load additional languages if needed
    await loadAdditionalLanguages();

    const grammar = Prism.languages[language];

    if (!grammar) {
      // Fallback to plain text if language not supported
      const tokens: Token[][] = code
        .split('\n')
        .map((line) => [{ content: line, type: 'plain' }]);
      return { tokens };
    }

    const prismTokens = Prism.tokenize(code, grammar);
    const tokens: Token[][] = [];
    let currentLine: Token[] = [];

    for (const token of prismTokens) {
      const flatTokens = flattenToken(token);

      for (const flatToken of flatTokens) {
        // Handle newlines within token content
        const parts = flatToken.content.split('\n');

        for (let i = 0; i < parts.length; i++) {
          if (i > 0) {
            // Start new line
            tokens.push(currentLine);
            currentLine = [];
          }
          const content = parts[i];
          if (content) {
            currentLine.push({ content, type: flatToken.type });
          }
        }
      }
    }

    // Push the last line
    tokens.push(currentLine);

    return { tokens };
  },

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  },
};

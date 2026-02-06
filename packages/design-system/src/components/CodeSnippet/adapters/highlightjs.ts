// Only import types from highlight.js — the library is loaded lazily via dynamic import
import type { HLJSApi } from 'highlight.js';

import type {
  HighlightJsLanguage,
  HighlightResult,
  SyntaxAdapter,
  Token,
  TokenType,
} from './types';

// Lazy-loaded hljs instance
let hljsPromise: Promise<HLJSApi> | null = null;

const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'bash',
  'json',
  'html',
  'xml',
  'css',
  'python',
  'go',
  'sql',
] as const satisfies readonly HighlightJsLanguage[];

/** Map highlight.js CSS classes to our strict TokenType */
function mapHljsClassToTokenType(className: string): TokenType {
  const classMap: Record<string, TokenType> = {
    'hljs-keyword': 'keyword',
    'hljs-built_in': 'builtin',
    'hljs-type': 'class-name',
    'hljs-literal': 'boolean',
    'hljs-number': 'number',
    'hljs-string': 'string',
    'hljs-regexp': 'regex',
    'hljs-comment': 'comment',
    'hljs-doctag': 'comment',
    'hljs-function': 'function',
    'hljs-title': 'function',
    'hljs-class': 'class-name',
    'hljs-variable': 'variable',
    'hljs-template-variable': 'variable',
    'hljs-attr': 'attr-name',
    'hljs-attribute': 'attr-name',
    'hljs-tag': 'tag',
    'hljs-name': 'tag',
    'hljs-selector-tag': 'tag',
    'hljs-selector-id': 'property',
    'hljs-selector-class': 'property',
    'hljs-property': 'property',
    'hljs-operator': 'operator',
    'hljs-punctuation': 'punctuation',
    'hljs-meta': 'keyword',
    'hljs-params': 'variable',
    'hljs-symbol': 'constant',
  };

  // Find the first matching class
  const classes = className.split(' ');
  for (const cls of classes) {
    if (classMap[cls]) {
      return classMap[cls];
    }
  }
  return 'plain';
}

/** Parse highlight.js HTML output into tokens (handles nested spans) */
function parseHljsHtml(html: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  // Stack to track nested span classes
  const classStack: string[] = [];

  while (pos < html.length) {
    // Check for opening span tag
    if (html.startsWith('<span class="', pos)) {
      const classStart = pos + 13; // length of '<span class="'
      const classEnd = html.indexOf('"', classStart);
      if (classEnd !== -1) {
        const className = html.slice(classStart, classEnd);
        classStack.push(className);
        pos = classEnd + 2; // skip '">'
        continue;
      }
    }

    // Check for closing span tag
    if (html.startsWith('</span>', pos)) {
      classStack.pop();
      pos += 7; // length of '</span>'
      continue;
    }

    // Check for other HTML tags (skip them)
    if (html[pos] === '<') {
      const tagEnd = html.indexOf('>', pos);
      if (tagEnd !== -1) {
        pos = tagEnd + 1;
        continue;
      }
    }

    // Collect text content until next tag
    let textEnd = html.indexOf('<', pos);
    if (textEnd === -1) textEnd = html.length;

    if (textEnd > pos) {
      const content = decodeHtmlEntities(html.slice(pos, textEnd));
      if (content) {
        // Use the innermost (most recent) class from the stack
        const currentClass = classStack[classStack.length - 1] || '';
        tokens.push({
          content,
          type: currentClass ? mapHljsClassToTokenType(currentClass) : 'plain',
        });
      }
      pos = textEnd;
    } else {
      pos++;
    }
  }

  return tokens;
}

/** Decode HTML entities */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

async function getHljs() {
  if (!hljsPromise) {
    hljsPromise = import('highlight.js').then((module) => module.default);
  }
  return hljsPromise;
}

export const highlightJsAdapter: SyntaxAdapter<HighlightJsLanguage> = {
  name: 'highlight.js',

  async highlight(
    code: string,
    language: HighlightJsLanguage,
  ): Promise<HighlightResult> {
    try {
      const hljs = await getHljs();

      const result = hljs.highlight(code, { language });
      const lines = result.value.split('\n');

      const tokens: Token[][] = lines.map((line) => {
        if (!line) return [{ content: '', type: 'plain' as const }];
        return parseHljsHtml(line);
      });

      return { tokens, html: result.value };
    } catch {
      // Fallback to plain text if highlighting fails
      const tokens: Token[][] = code
        .split('\n')
        .map((line) => [{ content: line, type: 'plain' as const }]);
      return { tokens };
    }
  },

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  },
};

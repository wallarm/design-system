/** Supported language union types per adapter */
export type PrismLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'bash'
  | 'shell'
  | 'json'
  | 'html'
  | 'xml'
  | 'css'
  | 'python'
  | 'go'
  | 'sql'
  | 'yaml'
  | 'markdown';

export type ShikiLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'bash'
  | 'shell'
  | 'json'
  | 'html'
  | 'xml'
  | 'css'
  | 'python'
  | 'go'
  | 'sql'
  | 'yaml'
  | 'markdown'
  | 'rust'
  | 'java'
  | 'c'
  | 'cpp';

export type HighlightJsLanguage =
  | 'javascript'
  | 'typescript'
  | 'bash'
  | 'json'
  | 'html'
  | 'xml'
  | 'css'
  | 'python'
  | 'go'
  | 'sql';

export type PlainLanguage = 'text' | 'plain';

/** Strict token types for syntax highlighting */
export type TokenType =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'comment'
  | 'function'
  | 'number'
  | 'operator'
  | 'punctuation'
  | 'class-name'
  | 'property'
  | 'tag'
  | 'attr-name'
  | 'attr-value'
  | 'boolean'
  | 'builtin'
  | 'constant'
  | 'regex'
  | 'variable';

export type Token = {
  content: string;
  type: TokenType;
  className?: string;
};

export type HighlightResult = {
  tokens: Token[][];
  html?: string;
};

/** Generic adapter interface with language constraint */
export type SyntaxAdapter<TLanguage extends string = string> = {
  name: string;
  highlight: (code: string, language: TLanguage) => Promise<HighlightResult>;
  getSupportedLanguages: () => readonly TLanguage[];
};

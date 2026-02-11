export { plainAdapter } from './plain';
export type {
  HighlightJsLanguage,
  HighlightResult,
  PlainLanguage,
  PrismLanguage,
  ShikiLanguage,
  SyntaxAdapter,
  Token,
  TokenType,
} from './types';

/**
 * Lazily load the Prism adapter for syntax highlighting.
 * Lightweight, good for most use cases.
 * Bundle size: ~15KB gzipped
 */
export const loadPrismAdapter = async () => {
  const { prismAdapter } = await import('./prism');
  return prismAdapter;
};

/**
 * Lazily load the Shiki adapter for syntax highlighting.
 * High-quality highlighting with VS Code themes, supports more languages.
 * Bundle size: ~200KB+ gzipped (includes WASM)
 */
export const loadShikiAdapter = async () => {
  const { shikiAdapter } = await import('./shiki');
  return shikiAdapter;
};

/**
 * Lazily load the highlight.js adapter for syntax highlighting.
 * Well-established library, good language support.
 * Bundle size: ~30KB gzipped (core + common languages)
 */
export const loadHighlightJsAdapter = async () => {
  const { highlightJsAdapter } = await import('./highlightjs');
  return highlightJsAdapter;
};

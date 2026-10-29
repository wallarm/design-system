// Keep async loaders in independent modules so unused loaders and their chunk
// graphs can be discarded by consumers of this barrel.
export { loadHighlightJsAdapter } from './loadHighlightJsAdapter';
export { loadPrismAdapter } from './loadPrismAdapter';
export { loadShikiAdapter } from './loadShikiAdapter';
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

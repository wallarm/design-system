import type { CSSProperties, ReactNode } from 'react';
import { createContext } from 'react';
import type { SyntaxAdapter, Token } from './adapters/types';

export type CodeSnippetSize = 'sm' | 'md' | 'lg';

export type LineColor = 'danger' | 'warning' | 'info' | 'success' | 'brand' | 'ai' | 'neutral';

export type LineTextStyle = 'regular' | 'medium' | 'italic';

export type LineRange = {
  /** 0-based inclusive start character index */
  start: number;
  /** 0-based exclusive end character index */
  end: number;
  /** Color applied to the range text (bold + colored). Falls back to the line's color. */
  color?: LineColor;
};

export type LineConfig = {
  /** Color for the line indicator, background, and text */
  color?: LineColor;
  /** Character ranges within the line to highlight with colored bold text */
  ranges?: LineRange[];
  /** Prefix content (text, icon, etc.) displayed before the line content */
  prefix?: ReactNode;
  /** Text style variant for the line */
  textStyle?: LineTextStyle;
  /** Additional CSS class name for the line text */
  className?: string;
  /** Inline styles for the line text */
  style?: CSSProperties;
};

export type CodeSnippetContextValue<TLanguage extends string = string> = {
  // Content
  code: string;
  language: TLanguage;
  tokens: Token[][] | null;
  isLoading: boolean;

  // Display options
  size: CodeSnippetSize;
  wrapLines: boolean;
  startingLineNumber: number;
  /** When true, gutter elements (color stick, line numbers, prefix) should be rendered inline with code (used when wrapLines is true) */
  inlineGutter: boolean;
  /** When true, show line numbers (either in gutter or inline depending on inlineGutter) */
  showLineNumbers: boolean;

  // Line features
  lines: Map<number, LineConfig>;

  // Expand/collapse
  isExpanded: boolean;
  maxLines: number;

  // Fullscreen
  isFullscreen: boolean;

  // Actions
  copyToClipboard: () => Promise<void>;
  setWrapLines: (wrap: boolean) => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;

  // Adapter
  adapter: SyntaxAdapter<TLanguage> | null;
};

export const CodeSnippetContext = createContext<CodeSnippetContextValue | null>(null);

// Adapter context for providing adapter at app level
export type AdapterContextValue<TLanguage extends string = string> = {
  adapter: SyntaxAdapter<TLanguage>;
};

export const AdapterContext = createContext<AdapterContextValue | null>(null);

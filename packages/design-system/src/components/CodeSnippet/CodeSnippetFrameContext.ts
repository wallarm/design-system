import { createContext } from 'react';
import type { CodeSnippetSize } from './CodeSnippetContext';

/**
 * Frame-level state shared by the toolbar/show-more buttons.
 *
 * Provided by `CodeSnippetRoot` (and by `CodeEditorRoot`), so the frame
 * buttons work under either root without depending on the snippet's
 * render pipeline (`CodeSnippetContext`).
 */
export type CodeSnippetFrameContextValue = {
  size: CodeSnippetSize;
  /** Lazily reads the current text (snippet: `code` prop; editor: live document) */
  getCode: () => string;
  /** Called by the copy button after a copy; roots forward it to their `onCopy` */
  notifyCopied: () => void;
  wrapLines: boolean;
  setWrapLines: (wrap: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  maxLines: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  /** max(0, totalRows - maxLines) — independent of isExpanded; 0 when maxLines <= 0 */
  hiddenLineCount: number;
};

export const CodeSnippetFrameContext = createContext<CodeSnippetFrameContextValue | null>(null);

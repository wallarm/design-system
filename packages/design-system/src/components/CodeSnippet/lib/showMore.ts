import { Children, isValidElement, type ReactNode } from 'react';
import { MIN_HIDDEN_LINES_THRESHOLD } from '../CodeSnippetContext';

/**
 * Must equal `CodeSnippetShowMoreButton.displayName`. Kept as a literal so this
 * module does not import the component (avoids a lib -> component -> hooks cycle);
 * `showMore.test.ts` pins the match against the real component.
 */
const SHOW_MORE_BUTTON_DISPLAY_NAME = 'CodeSnippetShowMoreButton';

/** True when a direct child is a `CodeSnippetShowMoreButton` (root then skips the auto-rendered one). */
export const hasExplicitShowMoreButton = (children: ReactNode): boolean =>
  Children.toArray(children).some(
    child =>
      isValidElement(child) &&
      typeof child.type !== 'string' &&
      (child.type as { displayName?: string }).displayName === SHOW_MORE_BUTTON_DISPLAY_NAME,
  );

/** Rows beyond `maxLines`, independent of the expanded state. 0 when `maxLines <= 0`. */
export const getHiddenLineCount = (totalRows: number, maxLines: number): number =>
  maxLines > 0 ? Math.max(0, totalRows - maxLines) : 0;

/** Whether content is currently clipped to `maxLines`. */
export const isClamped = (hiddenLineCount: number, isExpanded: boolean): boolean =>
  hiddenLineCount >= MIN_HIDDEN_LINES_THRESHOLD && !isExpanded;

import type { FoldRegion } from './foldUtils';

export const HTTP_FOLD_ID = {
  headers: 'http-headers',
  body: 'http-body',
} as const;

export type HttpFoldSectionOptions = {
  label?: string;
  defaultCollapsed?: boolean;
};

export type HttpFoldOptions = {
  headers?: HttpFoldSectionOptions;
  body?: HttpFoldSectionOptions;
  /** Must match the startingLineNumber passed to CodeSnippetRoot. Default: 1 */
  startingLineNumber?: number;
};

/**
 * Detects header and body sections in an HTTP request/response and returns fold regions.
 *
 * Expected structure:
 * - Line 1: Request line (e.g. `GET /path HTTP/1.1`) or status line (e.g. `HTTP/1.1 200 OK`)
 * - Lines 2–N: Headers (key: value)
 * - Empty line: separator
 * - Remaining lines: Body (optional)
 *
 * Returns up to two fold regions (headers, body). Sections that don't exist are omitted.
 */
export function getHttpFolds(code: string, options?: HttpFoldOptions): FoldRegion[] {
  const lines = code.split('\n');
  const folds: FoldRegion[] = [];
  const offset = (options?.startingLineNumber ?? 1) - 1;

  // Find the first empty line (header/body separator)
  let separatorIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '') {
      separatorIndex = i;
      break;
    }
  }

  // Headers: from line 2 to the line before the separator (or end if no separator)
  const headersStart = 2 + offset;
  const headersEnd = (separatorIndex === -1 ? lines.length : separatorIndex) + offset;

  if (headersEnd >= headersStart) {
    folds.push({
      id: HTTP_FOLD_ID.headers,
      startLine: headersStart,
      endLine: headersEnd,
      label: options?.headers?.label ?? 'Headers',
      defaultCollapsed: options?.headers?.defaultCollapsed,
    });
  }

  // Body: from the line after the separator to the end
  if (separatorIndex !== -1) {
    const bodyStart = separatorIndex + 2 + offset;
    const bodyEnd = lines.length + offset;

    if (bodyEnd >= bodyStart) {
      folds.push({
        id: HTTP_FOLD_ID.body,
        startLine: bodyStart,
        endLine: bodyEnd,
        label: options?.body?.label ?? 'Body',
        defaultCollapsed: options?.body?.defaultCollapsed,
      });
    }
  }

  return folds;
}

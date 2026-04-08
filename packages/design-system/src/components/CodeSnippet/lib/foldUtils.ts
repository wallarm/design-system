export type FoldRegion = {
  /** Unique identifier for this fold region */
  id: string;
  /** Inclusive start line number (1-based) */
  startLine: number;
  /** Inclusive end line number */
  endLine: number;
  /** Optional label for the collapsed summary. When omitted, auto-generated from line count. */
  label?: string;
  /** Whether the fold starts collapsed. Default: true */
  defaultCollapsed?: boolean;
};

export type DisplayItem =
  | { type: 'line'; index: number; lineNumber: number }
  | { type: 'fold-summary'; fold: FoldRegion; lineCount: number };

export function getFoldSummaryLabel(fold: FoldRegion, lineCount: number): string {
  return fold.label ?? `${lineCount} lines`;
}

/**
 * Validates fold regions and returns a clean, sorted list.
 * Dev: logs warnings for invalid folds. Prod: silently filters them out.
 */
export function validateFolds(
  folds: FoldRegion[],
  totalLines: number,
  startingLineNumber = 1,
): FoldRegion[] {
  const isDev = process.env.NODE_ENV !== 'production';
  const valid: FoldRegion[] = [];
  const seenIds = new Set<string>();
  const lastLine = startingLineNumber + totalLines - 1;

  const sorted = [...folds].sort((a, b) => a.startLine - b.startLine);

  for (const fold of sorted) {
    if (fold.startLine > fold.endLine) {
      if (isDev) {
        console.warn(
          `[CodeSnippet] Fold "${fold.id}": startLine (${fold.startLine}) > endLine (${fold.endLine}). Skipping.`,
        );
      }
      continue;
    }

    if (fold.startLine < startingLineNumber || fold.endLine > lastLine) {
      if (isDev) {
        console.warn(
          `[CodeSnippet] Fold "${fold.id}": out of bounds (lines ${fold.startLine}-${fold.endLine}, total ${totalLines}). Skipping.`,
        );
      }
      continue;
    }

    if (seenIds.has(fold.id)) {
      if (isDev) {
        console.warn(`[CodeSnippet] Fold "${fold.id}": duplicate id. Skipping.`);
      }
      continue;
    }

    const overlaps = valid.some(
      existing => fold.startLine <= existing.endLine && fold.endLine >= existing.startLine,
    );
    if (overlaps) {
      if (isDev) {
        console.warn(`[CodeSnippet] Fold "${fold.id}": overlaps with an existing fold. Skipping.`);
      }
      continue;
    }

    seenIds.add(fold.id);
    valid.push(fold);
  }

  return valid;
}

export function buildDisplayItems(
  totalLines: number,
  folds: FoldRegion[],
  collapsedFolds: Set<string>,
  startingLineNumber: number,
): DisplayItem[] {
  if (folds.length === 0) {
    return Array.from({ length: totalLines }, (_, index) => ({
      type: 'line' as const,
      index,
      lineNumber: startingLineNumber + index,
    }));
  }

  // Folds are already sorted by startLine from validateFolds
  const items: DisplayItem[] = [];
  let currentIndex = 0;

  for (const fold of folds) {
    const foldStartIndex = fold.startLine - startingLineNumber;
    const foldEndIndex = fold.endLine - startingLineNumber;

    // Add lines before this fold
    while (currentIndex < foldStartIndex) {
      items.push({
        type: 'line',
        index: currentIndex,
        lineNumber: startingLineNumber + currentIndex,
      });
      currentIndex++;
    }

    if (collapsedFolds.has(fold.id)) {
      // Collapsed: emit fold summary
      const lineCount = fold.endLine - fold.startLine + 1;
      items.push({
        type: 'fold-summary',
        fold,
        lineCount,
      });
    } else {
      // Expanded: emit all lines in range
      for (let i = foldStartIndex; i <= foldEndIndex; i++) {
        items.push({
          type: 'line',
          index: i,
          lineNumber: startingLineNumber + i,
        });
      }
    }

    currentIndex = foldEndIndex + 1;
  }

  // Add remaining lines after last fold
  while (currentIndex < totalLines) {
    items.push({
      type: 'line',
      index: currentIndex,
      lineNumber: startingLineNumber + currentIndex,
    });
    currentIndex++;
  }

  return items;
}

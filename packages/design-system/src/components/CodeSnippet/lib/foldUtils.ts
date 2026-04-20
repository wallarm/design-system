export type FoldRegion = {
  /** Unique identifier for this fold region */
  id: string;
  /** Inclusive start line number (1-based) */
  startLine: number;
  /** Inclusive end line number */
  endLine: number;
  /** Optional label for the collapsed summary. When omitted, auto-generated from line count. */
  label?: string;
  /** Whether the fold starts collapsed. Default: false */
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
/** True when `outer` strictly contains `inner` (equal ranges are NOT strict). */
function strictlyContains(outer: FoldRegion, inner: FoldRegion): boolean {
  return (
    outer.startLine <= inner.startLine &&
    outer.endLine >= inner.endLine &&
    (outer.startLine < inner.startLine || outer.endLine > inner.endLine)
  );
}

function intersects(a: FoldRegion, b: FoldRegion): boolean {
  return a.startLine <= b.endLine && a.endLine >= b.startLine;
}

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

    // Allow strict containment (nested folds), reject partial overlap and
    // identical ranges (ambiguous which is the parent).
    const badOverlap = valid.some(existing => {
      if (!intersects(fold, existing)) return false;
      return !strictlyContains(fold, existing) && !strictlyContains(existing, fold);
    });
    if (badOverlap) {
      if (isDev) {
        console.warn(
          `[CodeSnippet] Fold "${fold.id}": partially overlaps an existing fold (neither strictly contains the other). Skipping.`,
        );
      }
      continue;
    }

    seenIds.add(fold.id);
    valid.push(fold);
  }

  return valid;
}

export type FoldNode = {
  fold: FoldRegion;
  children: FoldNode[];
};

/**
 * Build a forest of folds from a validated flat list. Folds are nested when
 * one strictly contains another. Siblings are independent folds at the same
 * depth.
 */
export function buildFoldTree(folds: FoldRegion[]): FoldNode[] {
  // Outermost folds first — at the same startLine, the one that ends later
  // is the parent of the one that ends earlier.
  const sorted = [...folds].sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);

  const roots: FoldNode[] = [];
  const stack: FoldNode[] = [];

  for (const fold of sorted) {
    let top = stack[stack.length - 1];
    while (top && !strictlyContains(top.fold, fold)) {
      stack.pop();
      top = stack[stack.length - 1];
    }
    const node: FoldNode = { fold, children: [] };
    if (top) {
      top.children.push(node);
    } else {
      roots.push(node);
    }
    stack.push(node);
  }

  return roots;
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

  const tree = buildFoldTree(folds);
  const items: DisplayItem[] = [];

  const emitLine = (index: number) => {
    items.push({ type: 'line', index, lineNumber: startingLineNumber + index });
  };

  // Emit display items for the range [startIdx, endIdx) descending into
  // child fold nodes in order. Children are assumed sorted by startLine.
  const emitRange = (startIdx: number, endIdx: number, nodes: FoldNode[]) => {
    let cursor = startIdx;

    for (const node of nodes) {
      const foldStartIdx = node.fold.startLine - startingLineNumber;
      const foldEndIdx = node.fold.endLine - startingLineNumber;

      // Lines before this fold (inside the parent's content, outside child)
      while (cursor < foldStartIdx) {
        emitLine(cursor);
        cursor++;
      }

      if (collapsedFolds.has(node.fold.id)) {
        items.push({
          type: 'fold-summary',
          fold: node.fold,
          lineCount: node.fold.endLine - node.fold.startLine + 1,
        });
      } else {
        // Header line belongs to the current fold, not to any of its children
        emitLine(foldStartIdx);
        // Recurse into the fold's body — child folds live inside [header+1, end]
        emitRange(foldStartIdx + 1, foldEndIdx + 1, node.children);
      }

      cursor = foldEndIdx + 1;
    }

    while (cursor < endIdx) {
      emitLine(cursor);
      cursor++;
    }
  };

  emitRange(0, totalLines, tree);
  return items;
}

import type { FoldRegion } from './foldUtils';

/**
 * Count the leading-whitespace width of a line, expanding tabs to the next
 * 2-column boundary. Returns the column where the first non-whitespace
 * character sits (0 for flush-left code).
 */
export function leadingIndentColumn(line: string, tabSize = 2): number {
  if (tabSize <= 0) return 0;
  let columns = 0;
  for (const ch of line) {
    if (ch === ' ') columns += 1;
    else if (ch === '\t') columns += tabSize - (columns % tabSize);
    else return columns;
  }
  return columns;
}

export type FoldGuide = {
  /** Column (in monospace chars) where the guide line sits */
  column: number;
  /** Raw indent column of the fold's header line (used for summary indentation) */
  headerIndent: number;
  /** Absolute first line number that gets the guide (always startLine + 1) */
  firstLine: number;
  /** Absolute last line number that gets the guide */
  lastLine: number;
};

/**
 * For each fold, determine where its guide line sits and which rows it
 * covers.
 *
 * Column placement: the fold header's own indent column (VSCode-style outer
 * edge of the block). For Python `    def foo():` → col 4. For top-level
 * brace blocks where the header sits at col 0 we bump to col 1 so the guide
 * is visible inside the code area rather than flush with the pre's edge.
 *
 * Row extent: trails off at the last content row whose indent is strictly
 * greater than the header's. This drops closing-bracket lines (like `}`,
 * `</body>`) from bracket-style languages — the block visually ends with the
 * last indented line, not on the dedent that closes it. Indent-sensitive
 * languages like Python aren't affected because content stays deeper than
 * the header for all rows.
 */
export function computeFoldGuides(
  code: string,
  folds: FoldRegion[],
  startingLineNumber: number,
  tabSize = 2,
): Map<string, FoldGuide> {
  const lines = code.split('\n');
  const result = new Map<string, FoldGuide>();

  for (const fold of folds) {
    const headerIdx = fold.startLine - startingLineNumber;
    const endIdx = fold.endLine - startingLineNumber;
    const headerIndent = leadingIndentColumn(lines[headerIdx] ?? '', tabSize);

    let lastIndentedIdx = headerIdx; // fallback if all content is blank
    for (let i = headerIdx + 1; i <= endIdx && i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined || line.trim().length === 0) continue;
      if (leadingIndentColumn(line, tabSize) > headerIndent) {
        lastIndentedIdx = i;
      }
    }

    result.set(fold.id, {
      column: Math.max(headerIndent, 1),
      headerIndent,
      firstLine: fold.startLine + 1,
      lastLine: startingLineNumber + lastIndentedIdx,
    });
  }

  return result;
}

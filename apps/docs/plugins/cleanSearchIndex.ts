import type { RspressPlugin } from '@rspress/core';

/** Remove JSX component tags (`<Name ...>`, `<Name ... />`, `</Name>`) and their attributes. */
export function stripJsx(content: string): string {
  const withoutClosing = content.replace(/<\/[A-Z][\w.]*\s*>/g, '');
  let out = '';
  let i = 0;
  while (i < withoutClosing.length) {
    if (withoutClosing[i] !== '<' || !/[A-Z]/.test(withoutClosing[i + 1] ?? '')) {
      out += withoutClosing[i++];
      continue;
    }
    // Scan to the tag's closing `>`, ignoring any inside `{...}` or quotes.
    let depth = 0;
    let quote = '';
    let j = i + 1;
    for (; j < withoutClosing.length; j++) {
      const ch = withoutClosing[j];
      if (quote) {
        if (ch === quote) quote = '';
      } else if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth === 0) break;
    }
    if (j >= withoutClosing.length) {
      // Unterminated: keep as text rather than swallow the rest of the page.
      out += withoutClosing[i++];
    } else i = j + 1;
  }
  return out;
}

/**
 * Strip JSX from `content` while keeping `toc[].charIndex` (offsets into `content`, used to
 * slice per-heading sections) valid: each heading-delimited chunk is stripped on its own.
 */
export function stripPageContent(
  content: string,
  toc: { charIndex: number }[],
): { content: string; charIndexes: number[] } {
  const cuts = [...toc.map(t => t.charIndex)].sort((a, b) => a - b);
  const starts = [0, ...cuts];
  let out = '';
  const offsets = new Map<number, number>();
  starts.forEach((start, n) => {
    const chunk = stripJsx(content.slice(start, starts[n + 1] ?? content.length));
    if (n > 0) offsets.set(start, out.length);
    out += chunk;
  });
  return { content: out, charIndexes: toc.map(t => offsets.get(t.charIndex) ?? 0) };
}

export function cleanSearchIndex(): RspressPlugin {
  return {
    name: 'clean-search-index',
    modifySearchIndexData(pages) {
      for (const page of pages) {
        const { content, charIndexes } = stripPageContent(page.content, page.toc);
        page.content = content;
        page.toc.forEach((t, i) => {
          t.charIndex = charIndexes[i] ?? t.charIndex;
        });
        if (page.description) page.description = stripJsx(page.description).trim();
      }
    },
  };
}

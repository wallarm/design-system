import type { RspressPlugin } from '@rspress/core';

/**
 * Remove every capitalised JSX tag (`<Name ...>`, `<Name ... />`, `</Name>`) together with its
 * attributes, not just StoryPreview/Explorer/TokenTable: any component's attributes are index
 * noise. Children between an opening and closing tag are kept as text.
 *
 * Inline code spans (`` `<Button>` ``) are left untouched. A tag scan that reaches a blank line
 * outside quotes and braces is abandoned and the text kept as-is, so a stray `<Name` in prose
 * can never swallow the paragraphs up to some later `>`.
 */
export function stripJsx(content: string): string {
  let out = '';
  let i = 0;
  while (i < content.length) {
    const c = content[i];
    if (c === '`') {
      const end = content.indexOf('`', i + 1);
      const stop = end === -1 ? i + 1 : end + 1;
      out += content.slice(i, stop);
      i = stop;
      continue;
    }
    if (c !== '<') {
      out += c;
      i++;
      continue;
    }
    const closing = /^<\/[A-Z][\w.]*\s*>/.exec(content.slice(i, i + 200));
    if (closing) {
      i += closing[0].length;
      continue;
    }
    if (!/[A-Z]/.test(content[i + 1] ?? '')) {
      out += c;
      i++;
      continue;
    }
    // Scan to the tag's closing `>`, ignoring any inside `{...}` or quotes.
    let depth = 0;
    let quote = '';
    let j = i + 1;
    for (; j < content.length; j++) {
      const ch = content[j];
      if (quote) {
        if (ch === quote) quote = '';
      } else if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth === 0) break;
      else if (ch === '\n' && content[j + 1] === '\n' && depth <= 0) {
        j = content.length;
        break;
      }
    }
    if (j >= content.length) {
      // Unterminated or runaway: keep the `<` as text and carry on after it.
      out += c;
      i++;
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

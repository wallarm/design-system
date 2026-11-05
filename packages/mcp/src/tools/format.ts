import type { PropMetadata } from '@wallarm-org/mcp-core';

/** Hard cap for one tool response, well under Claude Code's 25k-token MCP output limit. */
export const RESPONSE_LIMIT = 40_000;

/** Split a type on top-level `|` (not inside `{}`, `()`, `<>`, `[]` or quotes). */
const splitUnion = (type: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < type.length; i++) {
    const ch = type[i];
    if (quote) {
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if ('{(<['.includes(ch ?? '')) depth++;
    else if ('})>]'.includes(ch ?? '') && !(ch === '>' && type[i - 1] === '=')) depth--;
    else if (ch === '|' && depth === 0) {
      parts.push(type.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(type.slice(start).trim());
  return parts.filter(Boolean);
};

/**
 * Compact a prop type: drop `undefined` (optional is shown separately), collapse long unions to
 * the first `maxMembers` members plus `…(+K)`, and cut anything still over `maxLength`.
 */
export const formatType = (type: string, maxMembers = 8, maxLength = 160): string => {
  const members = splitUnion(type).filter(m => m !== 'undefined');
  let out =
    members.length > maxMembers
      ? `${members.slice(0, maxMembers).join(' | ')} | …(+${members.length - maxMembers})`
      : members.join(' | ') || type;
  if (out.length > maxLength) out = `${out.slice(0, maxLength)}…`;
  return out;
};

const cell = (text: string) => text.replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|');

/** First sentence of `text` on one line, cut at `max` chars. */
export const oneLine = (text: string, max = 140) => {
  const flat = text.replace(/\s*\n\s*/g, ' ').trim();
  const end = flat.search(/[.!?](\s|$)/);
  const sentence = end === -1 ? flat : flat.slice(0, end + 1);
  return sentence.length > max ? `${sentence.slice(0, max)}…` : sentence;
};

interface PropsTableOptions {
  /** Shorten descriptions to their first sentence. */
  brief?: boolean;
  maxMembers?: number;
}

/** Markdown props table; Required/Default/Description columns appear only when some prop has them. */
export const formatPropsTable = (
  props: PropMetadata[],
  options: PropsTableOptions = {},
): string => {
  if (props.length === 0) return '';
  const { brief = false, maxMembers = brief ? 8 : 30 } = options;
  const hasRequired = props.some(p => p.required);
  const hasDefault = props.some(p => p.defaultValue !== undefined);
  const hasDescription = props.some(p => p.description);

  const head = ['Prop', 'Type'];
  if (hasRequired) head.push('Required');
  if (hasDefault) head.push('Default');
  if (hasDescription) head.push('Description');

  const rows = props.map(p => {
    const row = [`\`${p.name}\``, `\`${cell(formatType(p.type, maxMembers, brief ? 160 : 400))}\``];
    if (hasRequired) row.push(p.required ? 'yes' : '');
    if (hasDefault) row.push(p.defaultValue !== undefined ? `\`${cell(p.defaultValue)}\`` : '');
    if (hasDescription) {
      const desc = p.description ?? '';
      row.push(cell(brief ? oneLine(desc) : desc));
    }
    return `| ${row.join(' | ')} |`;
  });

  return [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows].join('\n');
};

/**
 * Split markdown into pages under `limit` chars, cutting at headings (then at lines when one
 * section is too long). Returns the requested 1-based page with a footer pointing at the next one.
 */
export const paginate = (
  text: string,
  page: number,
  nextCall: (page: number) => string,
  limit = RESPONSE_LIMIT,
): string => {
  const budget = limit - 1000; // room for the page, section and source footers
  if (text.length <= budget && page <= 1) return text;

  const blocks = text.split(/\n(?=#{1,3} )/);
  const pages: string[] = [];
  let current = '';
  const push = (piece: string) => {
    if (current && current.length + piece.length + 1 > budget) {
      pages.push(current);
      current = '';
    }
    current = current ? `${current}\n${piece}` : piece;
  };
  for (const block of blocks) {
    if (block.length <= budget) push(block);
    else for (const line of block.split('\n')) push(line.slice(0, budget));
  }
  if (current) pages.push(current);

  const total = pages.length;
  const index = Math.min(Math.max(page, 1), total) - 1;
  const footer =
    index + 1 < total
      ? `\n\n---\nPage ${index + 1}/${total}. Call again with ${nextCall(index + 2)} for the next page.`
      : `\n\n---\nPage ${index + 1}/${total} (last).`;
  return `${pages[index]}${footer}`;
};

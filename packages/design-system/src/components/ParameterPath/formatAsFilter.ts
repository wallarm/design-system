import type { CopyFormatData } from './types';

// FilterInput tokenizer accepts "…" or '…' but has no escape syntax, so pick
// the quote not present in the value. If both appear, drop embedded `"`.
const quoteValue = (raw: string): string => {
  if (!raw.includes('"')) return `"${raw}"`;
  if (!raw.includes("'")) return `'${raw}'`;
  return `"${raw.replace(/"/g, '')}"`;
};

export const formatAsFilter = ({ method, segments, encoding }: CopyFormatData): string => {
  const parts: string[] = [];
  if (method) parts.push(`method = ${quoteValue(method)}`);
  if (segments.length > 0) parts.push(`parameter = ${quoteValue(segments.join('.'))}`);
  if (encoding) parts.push(`encoding = ${quoteValue(encoding)}`);
  return parts.join(' AND ');
};

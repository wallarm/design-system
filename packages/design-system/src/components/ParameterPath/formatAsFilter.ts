import type { CopyFormatData } from './types';

/**
 * Default Cmd+C serializer. Produces a FilterInput-compatible expression:
 * `method == "POST" AND parameter == "a.b" AND encoding == "BASE64"`.
 *
 * Override via `copyFormat` prop if the consuming platform uses different field names.
 */
export const formatAsFilter = ({ method, segments, encoding }: CopyFormatData): string => {
  const parts: string[] = [];
  if (method) parts.push(`method == "${method}"`);
  if (segments.length > 0) parts.push(`parameter == "${segments.join('.')}"`);
  if (encoding) parts.push(`encoding == "${encoding}"`);
  return parts.join(' AND ');
};

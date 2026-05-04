import type { HttpMethod } from './types';

export const buildFullPathLabel = (
  method: HttpMethod | undefined,
  segments: string[],
  encoding?: string,
): string => {
  const parts: string[] = [];
  if (method) parts.push(method);
  parts.push(...segments);
  if (encoding) parts.push(encoding);
  return parts.join(' › ');
};

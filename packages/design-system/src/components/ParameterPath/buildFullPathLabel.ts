import type { HttpMethodName } from '../HttpMethod';

export const buildFullPathLabel = (
  method: HttpMethodName | undefined,
  segments: string[],
  encoding?: string,
): string => {
  const parts: string[] = [];
  if (method) parts.push(method);
  parts.push(...segments);
  if (encoding) parts.push(encoding);
  return parts.join(' › ');
};

import type { BadgeColor } from '../Badge';
import type { HttpMethodName } from './types';

export const HTTP_METHODS: readonly HttpMethodName[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;

/**
 * Color mapping per Figma `http-method` (`5179:11016`). Colors reflect each
 * method's intent and risk level (safe reads → green, destructive → rose,
 * technical/preflight → slate). Anything outside `HTTP_METHODS` falls through
 * to `OTHER_METHOD_COLOR`.
 */
export const HTTP_METHOD_COLOR: Record<HttpMethodName, BadgeColor> = {
  GET: 'green',
  POST: 'yellow',
  PUT: 'blue',
  PATCH: 'violet',
  DELETE: 'rose',
  HEAD: 'teal',
  OPTIONS: 'slate',
};

export const OTHER_METHOD_COLOR: BadgeColor = 'slate';

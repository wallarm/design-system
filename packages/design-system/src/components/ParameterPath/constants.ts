import type { BadgeColor } from '../Badge';
import type { HttpMethod } from './types';

export const HTTP_METHOD_COLOR: Record<HttpMethod, BadgeColor> = {
  GET: 'green',
  POST: 'yellow',
  PUT: 'blue',
  PATCH: 'cyan',
  DELETE: 'red',
  HEAD: 'slate',
  OPTIONS: 'violet',
};

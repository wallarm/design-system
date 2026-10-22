import {
  findComponentElements,
  getAttribute,
  hasSpread,
  readStaticString,
  replaceStaticString,
} from '../lib/jsx';
import type { Migration } from '../lib/types';

const RENAMES: Record<string, string> = { xs: 'md', sm: 'lg' };
const HINT = 'Avatar size was renamed (xs -> md, sm -> lg; new sm is 20px)';

export const migration: Migration = {
  id: 'avatar-size-rename',
  title: 'Avatar: xs → md, sm → lg',
  transform(file, ctx) {
    for (const el of findComponentElements(file, 'Avatar')) {
      const attr = getAttribute(el, 'size');
      if (attr) {
        const value = readStaticString(attr);
        const next = value === undefined ? undefined : RENAMES[value];
        if (value === undefined) ctx.report(attr, `${HINT}: non-static value, review manually`);
        else if (next && Object.hasOwn(RENAMES, value)) replaceStaticString(attr, next);
      } else if (hasSpread(el)) {
        ctx.report(el, `${HINT}: size may come from spread props, review manually`);
      }
    }
  },
};

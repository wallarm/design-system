import {
  findComponentElements,
  getAttribute,
  hasSpread,
  readStaticString,
  replaceStaticString,
} from '../lib/jsx';
import type { Migration } from '../lib/types';

const MAP: Record<string, [type: string, color: string]> = {
  primary: ['secondary', 'neutral'],
  'primary-alt': ['secondary', 'neutral-alt'],
  brand: ['solid', 'brand'],
  destructive: ['solid', 'danger'],
  outline: ['outline', 'neutral'],
  info: ['secondary', 'info'],
};
// `outline` is in both worlds; with an existing `color` these are already migrated.
const NEW_TYPES = new Set(['solid', 'secondary', 'outline']);
const HINT = 'NumericBadge type was split into type + color';

export const migration: Migration = {
  id: 'numeric-badge-type-color',
  title: 'NumericBadge: type splits into type + color',
  transform(file, ctx) {
    for (const el of findComponentElements(file, 'NumericBadge')) {
      const typeAttr = getAttribute(el, 'type');
      if (!typeAttr) {
        if (hasSpread(el))
          ctx.report(el, `${HINT}: type may come from spread props, review manually`);
        continue;
      }
      const value = readStaticString(typeAttr);
      if (value === undefined) {
        ctx.report(typeAttr, `${HINT}: non-static type, review manually`);
        continue;
      }
      if (!Object.hasOwn(MAP, value)) continue;
      if (getAttribute(el, 'color')) {
        if (!NEW_TYPES.has(value))
          ctx.report(typeAttr, `${HINT}: already has color, review manually`);
        continue;
      }
      const [type, color] = MAP[value] as [string, string];
      const q = typeAttr.getText().match(/['"]/)?.[0] ?? "'";
      replaceStaticString(typeAttr, type);
      typeAttr.replaceWithText(`${typeAttr.getText()} color=${q}${color}${q}`);
    }
  },
};

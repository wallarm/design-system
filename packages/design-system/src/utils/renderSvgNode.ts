import { createElement, type ReactNode } from 'react';

import type { SvgNode } from '../lib/agent-characters/svg';

// SVG attribute names → React props (stroke-width → strokeWidth); aria-* and data-* stay as they are. The core's
// `class` names become `data-part` tokens: CSS hooks without custom class names.
const reactName = (k: string) =>
  k.startsWith('aria-') || k.startsWith('data-')
    ? k
    : k.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());

/** Renders a core SvgNode tree. `extra` adds props to a node (baked image attributes, ready flags). */
export function renderSvgNode(
  n: SvgNode,
  key: number,
  extra?: (n: SvgNode) => Record<string, string | number | boolean | undefined> | undefined,
): ReactNode {
  const props: Record<string, unknown> = { key };
  for (const [k, v] of Object.entries(n.attrs)) {
    props[k === 'class' ? 'data-part' : reactName(k)] = v;
  }
  const more = extra?.(n);
  if (more) Object.assign(props, more);
  return createElement(
    n.tag,
    props,
    n.children?.map((c, i) => renderSvgNode(c, i, extra)),
  );
}

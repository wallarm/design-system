// A minimal SVG node tree: the core describes markup once; tests and the harness print it as the page's string,
// React renders the same nodes.

export interface SvgNode {
  tag: string;
  attrs: Record<string, string | number>;
  children?: SvgNode[];
}

const attrsOf = (attrs: Record<string, string | number>) =>
  Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');

export function toSvgString(
  tag: string,
  attrs: Record<string, string | number>,
  children?: SvgNode[],
): string {
  const inner = children?.map(c => toSvgString(c.tag, c.attrs, c.children)).join('');
  return children?.length
    ? `<${tag}${attrsOf(attrs)}>${inner}</${tag}>`
    : `<${tag}${attrsOf(attrs)}/>`;
}

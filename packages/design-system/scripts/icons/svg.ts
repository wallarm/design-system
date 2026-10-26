/**
 * Figma SVG export → JSX body for an `SvgIcon` component.
 *
 * Figma's `/v1/images?format=svg` output is regular XML with no text nodes, so a tiny
 * tag tokenizer is enough — no SVG/XML dependency.
 */

export interface SvgNode {
  tag: string;
  attrs: Record<string, string>;
  children: SvgNode[];
}

/** `mono` — UI glyph (ink → currentColor); `original` — brand colours kept; `neutral` — brand in currentColor. */
export type IconTone = 'mono' | 'original' | 'neutral';

export interface IconBody {
  viewBox: string;
  jsx: string;
  warnings: string[];
}

const FIGMA_INK = '#0F172B';
const PAINT_ATTRS = ['fill', 'stroke', 'stop-color'];
const SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon']);

export const parseSvg = (src: string): SvgNode => {
  const root: SvgNode = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const tokens = /<(\/?)([\w:-]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g;

  for (const [, close, tag, rawAttrs = '', selfClose, text] of src.matchAll(tokens)) {
    if (text !== undefined) {
      if (text.trim()) throw new Error(`Unexpected text in SVG: "${text.trim().slice(0, 40)}"`);
      continue;
    }
    if (close) {
      stack.pop();
      continue;
    }
    const attrs = Object.fromEntries(
      [...rawAttrs.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]),
    );
    const node: SvgNode = { tag: tag as string, attrs, children: [] };
    stack.at(-1)?.children.push(node);
    if (!selfClose) stack.push(node);
  }

  const svg = root.children[0];
  if (svg?.tag !== 'svg') throw new Error('Not an SVG document');
  return svg;
};

const walk = (
  node: SvgNode,
  visit: (n: SvgNode, parent: SvgNode | null) => void,
  parent: SvgNode | null = null,
) => {
  visit(node, parent);
  for (const child of node.children) walk(child, visit, node);
};

const clone = (node: SvgNode): SvgNode => ({
  tag: node.tag,
  attrs: { ...node.attrs },
  children: node.children.map(clone),
});

const isWhite = (v: string | undefined) => !!v && /^(white|#fff|#ffffff)$/i.test(v);
const isPaint = (v: string | undefined) => !!v && v !== 'none' && v !== 'currentColor';

/** Figma wraps clipped frames in `<g clip-path>` + a full-frame `<rect fill="white">` — pure export noise. */
const dropFrameClips = (svg: SvgNode, width: string, height: string) => {
  const defs = svg.children.find(c => c.tag === 'defs');
  if (!defs) return;
  const frameClipIds = new Set(
    defs.children
      .filter(c => {
        const rect = c.children[0];
        return (
          c.tag === 'clipPath' &&
          c.children.length === 1 &&
          rect?.tag === 'rect' &&
          !rect.attrs.transform &&
          (rect.attrs.x ?? '0') === '0' &&
          (rect.attrs.y ?? '0') === '0' &&
          rect.attrs.width === width &&
          rect.attrs.height === height
        );
      })
      .map(c => c.attrs.id),
  );
  if (!frameClipIds.size) return;

  defs.children = defs.children.filter(c => !frameClipIds.has(c.attrs.id));
  walk(svg, node => {
    node.children = node.children.flatMap(child => {
      const clipId = child.attrs['clip-path']?.match(/^url\(#(.+)\)$/)?.[1];
      if (!clipId || !frameClipIds.has(clipId)) return [child];
      delete child.attrs['clip-path'];
      return child.tag === 'g' && Object.keys(child.attrs).length === 0 ? child.children : [child];
    });
  });
};

/** Removes `<defs>` children nothing references anymore (e.g. gradients replaced by currentColor). */
const dropUnusedDefs = (svg: SvgNode) => {
  const refs = new Set<string>();
  walk(svg, n => {
    for (const v of Object.values(n.attrs))
      for (const [, id] of v.matchAll(/#([\w-]+)/g)) refs.add(id as string);
  });
  for (const defs of svg.children.filter(c => c.tag === 'defs')) {
    defs.children = defs.children.filter(c => !c.attrs.id || refs.has(c.attrs.id));
  }
  svg.children = svg.children.filter(c => c.tag !== 'defs' || c.children.length > 0);
};

/** The root `<svg fill="none">` is not carried over to `SvgIcon`, so make unfilled shapes explicit. */
const pinInheritedFill = (svg: SvgNode) => {
  if (svg.attrs.fill !== 'none') return;
  const visit = (node: SvgNode, inherited: boolean) => {
    const hasFill = inherited || node.attrs.fill !== undefined;
    if (SHAPES.has(node.tag) && !hasFill) node.attrs.fill = 'none';
    if (node.tag === 'defs' || node.tag === 'mask' || node.tag === 'clipPath') return;
    for (const child of node.children) visit(child, hasFill);
  };
  for (const child of svg.children) visit(child, false);
};

const COVERAGE = new Set(['defs', 'mask', 'clipPath']);

/** Visits painted content only: mask/clip geometry is coverage, its colour must stay as drawn. */
const walkInk = (node: SvgNode, visit: (n: SvgNode) => void) => {
  if (COVERAGE.has(node.tag)) return;
  visit(node);
  for (const child of node.children) walkInk(child, visit);
};

const setPaints = (node: SvgNode, map: (value: string, attr: string) => string) =>
  walkInk(node, n => {
    for (const attr of PAINT_ATTRS) {
      const value = n.attrs[attr];
      if (value !== undefined) n.attrs[attr] = map(value, attr);
    }
  });

/**
 * currentColor version of a brand mark. White ink (the "f" on the Facebook disc, Teams' "T")
 * becomes a cut-out mask, so the glyph shows the background instead of a white blob.
 */
const neutralize = (svg: SvgNode, width: string, height: string) => {
  const body = svg.children.filter(c => c.tag !== 'defs');
  let hasWhiteInk = false;
  for (const node of body)
    walkInk(node, n => {
      if (PAINT_ATTRS.some(a => isWhite(n.attrs[a]))) hasWhiteInk = true;
    });

  if (!hasWhiteInk) {
    for (const node of body) setPaints(node, v => (isPaint(v) ? 'currentColor' : v));
    return;
  }

  // ponytail: treats every white shape as a hole; a colour shape painted on top of white ink would be cut too.
  const cutouts = body.map(clone);
  for (const node of cutouts) {
    walk(node, n => delete n.attrs.id);
    setPaints(node, v => (isWhite(v) ? 'black' : isPaint(v) ? 'none' : v));
  }
  for (const node of body)
    setPaints(node, v => (isWhite(v) ? 'none' : isPaint(v) ? 'currentColor' : v));

  const mask: SvgNode = {
    tag: 'mask',
    attrs: { id: 'cutout', maskUnits: 'userSpaceOnUse', x: '0', y: '0', width, height },
    children: [{ tag: 'rect', attrs: { width, height, fill: 'white' }, children: [] }, ...cutouts],
  };
  let defs = svg.children.find(c => c.tag === 'defs');
  if (!defs) {
    defs = { tag: 'defs', attrs: {}, children: [] };
    svg.children.unshift(defs);
  }
  defs.children.push(mask);
  svg.children = [defs, { tag: 'g', attrs: { mask: 'url(#cutout)' }, children: body }];
};

/** Ids must be unique per page — many icons render side by side, and Figma reuses `paint0_linear…`. */
const prefixIds = (svg: SvgNode, prefix: string) => {
  const ids = new Set<string>();
  walk(svg, n => {
    if (n.attrs.id) ids.add(n.attrs.id);
  });
  if (!ids.size) return;
  walk(svg, n => {
    for (const [k, v] of Object.entries(n.attrs)) {
      if (k === 'id') n.attrs[k] = `${prefix}-${v}`;
      else n.attrs[k] = v.replace(/#([\w-]+)/g, (m, id) => (ids.has(id) ? `#${prefix}-${id}` : m));
    }
  });
};

const jsxAttrName = (name: string) =>
  name.startsWith('data-') || name.startsWith('aria-')
    ? name
    : name.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase());

const toJsx = (node: SvgNode): string => {
  const attrs = Object.entries(node.attrs)
    .map(([k, v]) => {
      if (v.includes("'")) throw new Error(`Unsupported quote in attribute ${k}`);
      if (k === 'style') {
        const decls = v.split(';').flatMap(d => {
          const [prop, val] = d.split(':').map(s => s.trim());
          return prop && val ? [`${jsxAttrName(prop)}: '${val}'`] : [];
        });
        return ` style={{ ${decls.join(', ')} }}`;
      }
      return ` ${jsxAttrName(k)}='${v}'`;
    })
    .join('');
  return node.children.length
    ? `<${node.tag}${attrs}>${node.children.map(toJsx).join('')}</${node.tag}>`
    : `<${node.tag}${attrs} />`;
};

export const svgToIconBody = (src: string, tone: IconTone, idPrefix: string): IconBody => {
  const svg = parseSvg(src);
  const warnings: string[] = [];
  const viewBox = svg.attrs.viewBox ?? `0 0 ${svg.attrs.width} ${svg.attrs.height}`;
  const [, , width = '24', height = '24'] = viewBox.split(/\s+/);

  dropFrameClips(svg, width, height);
  pinInheritedFill(svg);

  if (tone === 'mono') {
    // A UI glyph is single-colour by definition: whatever ink Figma used becomes currentColor.
    const stray = new Set<string>();
    for (const node of svg.children) {
      walkInk(node, n => {
        for (const a of PAINT_ATTRS) {
          const v = n.attrs[a];
          if (v && isPaint(v) && !isWhite(v) && v.toUpperCase() !== FIGMA_INK) stray.add(v);
        }
      });
    }
    if (stray.size)
      warnings.push(`Figma ink ${[...stray].join(', ')} ≠ ${FIGMA_INK}, mapped to currentColor`);
  }
  if (tone !== 'original') {
    neutralize(svg, width, height);
  }

  dropUnusedDefs(svg);
  prefixIds(svg, idPrefix);
  walk(svg, n => {
    if (n.tag === 'image' && !warnings.includes('contains a raster fill'))
      warnings.push('contains a raster fill');
  });

  return { viewBox, jsx: svg.children.map(toJsx).join('\n'), warnings };
};

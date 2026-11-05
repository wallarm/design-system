// makeChar() of the reference page (look v14) without the live loop: the 3D character's markup, and the static pose
// Char.render() draws when the springs sit at their targets (live: false). Ported line for line, attribute order
// included, so the printed tree equals the page's outerHTML.
import { hexOf, mix } from './color';
import { HARD, TONE } from './data.gen';
import { eyesPath, eyeTargets, type StateId } from './eyes';
import { geom, shapeOf } from './geom';
import type { Look } from './glyph';
import { r2 } from './paths';
import { propOf } from './propOf';
import type { SvgNode } from './svg';

export interface CharLayer {
  d: string;
  col: string;
  mat: 'felt' | 'vinyl';
  /** a layer of the grey ghost veil (baked only for Not set up, Inviting and the coverage crown) */
  veil: boolean;
}

export interface CharTree {
  width: number;
  height: number;
  /** the page's `.ch` classes: st-<state>, ghosting (the veil shows), veiled (colour layers hidden) */
  state: StateId;
  ghosting: boolean;
  veiled: boolean;
  children: SvgNode[];
  layers: CharLayer[];
}

export interface CharOptions {
  size: number;
  state: StateId;
  shadow: boolean;
  /** Partial coverage: the crown */
  cover: boolean;
  /** id prefix, unique per instance */
  ids: string;
}

const el = (
  tag: string,
  attrs: Record<string, string | number>,
  children?: SvgNode[],
): SvgNode => ({ tag, attrs, ...(children ? { children } : {}) });
/** The page's inline markup fragments (prop deco) re-parsed as nodes: self-closing tags and one level of <g>. */
function parseFragment(s: string): SvgNode[] {
  const out: SvgNode[] = [];
  const stack: SvgNode[][] = [out];
  for (const m of s.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    const [, close, tag, rest, self] = m as unknown as [string, string, string, string, string];
    if (close) {
      stack.pop();
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of rest.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[a[1] as string] = a[2] as string;
    const node: SvgNode = { tag, attrs };
    (stack[stack.length - 1] as SvgNode[]).push(node);
    if (!self) {
      node.children = [];
      stack.push(node.children);
    }
  }
  return out;
}

export function charTree(c: Look, o: CharOptions): CharTree {
  const S = shapeOf(c.shape);
  const G = geom(S);
  const col = hexOf(c.color);
  const { size, ids: id } = o;
  const st = o.state;
  const [vx, vy, vw, vh] = S.v;
  const vr = vh * 0.46;
  const ecol = c.color === 'coral' ? '#FF7A5E' : mix(col, '#ffffff', 0.62);
  const dk = mix(col, '#0d0b0c', 0.34);
  const lt = mix(col, '#ffffff', 0.4);
  const layers: CharLayer[] = [];
  const LY = (
    d: string,
    color: string,
    mat: 'vinyl' | 'felt' | null,
    lgFill?: string,
    cls = '',
    veil = false,
  ): SvgNode => {
    const i = layers.length;
    layers.push({
      d,
      col: color,
      mat: mat ?? 'felt',
      veil,
    });
    return el('g', { class: `ly ${cls}`, 'data-j': i }, [
      el('path', { class: 'lg', d, fill: lgFill || color }),
      el('image', { class: 'li', preserveAspectRatio: 'none' }),
    ]);
  };
  const partCol = (p: { tone: string }) =>
    (TONE as Partial<Record<string, string>>)[p.tone] ?? p.tone;
  const parts = S.parts || [];
  const back = parts
    .filter(p => p.z === 'b')
    .map(p => LY(p.d, partCol(p), HARD.has(p.tone) ? 'vinyl' : null));
  const front = parts
    .filter(p => p.z !== 'b')
    .map(p => LY(p.d, partCol(p), HARD.has(p.tone) ? 'vinyl' : null));
  const body = LY(S.d, col, null, `url(#${id}g)`, 'bodyly');
  const P = c.prop && c.prop !== 'none' ? propOf(c.prop, S, col) : null;
  const pv = P ? P.layers.map(l => LY(l.d, l.col, l.mat)) : [];
  const pdeco = P ? P.deco.filter(x => !x.clip).flatMap(x => parseFragment(x.s)) : [];
  const pdecoClip = P ? P.deco.filter(x => x.clip).flatMap(x => parseFragment(x.s)) : [];
  // ghostable: the grey felt veil over every outline, baked on demand
  const veil = el(
    'g',
    { class: 'veil', 'clip-path': `url(#${id}v)` },
    [...parts.filter(p => p.z === 'b'), { d: S.d }, ...parts.filter(p => p.z !== 'b')].map(p =>
      LY(p.d, '#C2C7CF', 'felt', '#C2C7CF', 'vy', true),
    ),
  );

  // ── the static pose: Char.applyState(st, first) then render() with no clock ──
  const t = eyeTargets(c.eyes, st === 'power' ? 'box' : st);
  const box = st === 'box';
  const ghostT = box || st === 'invite' ? 0 : 1;
  const figOp = box ? 0.5 : 1;
  const propScale = box || st === 'invite' ? 0 : 1;
  const work = st === 'working' ? 1 : 0;
  const ty = box ? -8 : 0;
  const shadowK = box ? 0.35 : 1;
  const d0 = eyesPath(S, t, 1, 0, t.gy);
  const bo = r2(Math.max(0, Math.min(1.2, t.bright)));
  const cover = o.cover && st !== 'off';
  let veilH: number;
  if (cover) {
    const covT = G.top[1];
    const covY = Math.min(covT + 0.3 * (108 - covT), vy - 4);
    veilH = r2(Math.max(covY, covT + 0.2 * (covY - covT)) + 30);
  } else veilH = r2(140 * (1 - ghostT));

  const shadow: SvgNode[] = [];
  if (o.shadow) {
    const [fl, fr] = G.foot;
    const hw = Math.max(12, (fr - fl) / 2);
    const cx = r2((fl + fr) / 2);
    const hgt = Math.max(0, Math.min(1, -ty / 12));
    const kA = (1 - 0.2 * hgt) * shadowK;
    const kC = (1 - 0.45 * hgt) * shadowK;
    shadow.push(
      el('g', { class: 'shd' }, [
        el('ellipse', {
          class: 'sha',
          cx,
          cy: 108.5,
          rx: r2(hw * 1.3),
          ry: 8,
          fill: `url(#${id}s)`,
          opacity: r2(0.16 * (1 - 0.4 * hgt) * shadowK),
          transform: `translate(${cx} 108) scale(${r2(kA)} ${r2(kA)}) translate(${-cx} -108)`,
        }),
        el('ellipse', {
          class: 'shc',
          cx,
          cy: 108,
          rx: r2(hw * 0.95),
          ry: 3.6,
          fill: `url(#${id}s)`,
          opacity: r2(0.36 * (1 - 0.8 * hgt) * shadowK),
          transform: `translate(${cx} 108) scale(${r2(kC)} 1) translate(${-cx} -108)`,
        }),
      ]),
    );
  }

  const lipY = vy + vh + 0.9;
  const pa: Record<string, string | number> = P?.anim
    ? { class: 'pa', 'data-a': P.anim.type, 'data-px': P.anim.px, 'data-py': P.anim.py }
    : {};
  // the beam's opacity follows the work weight even when static (0.55 in Working)
  for (const n of pdeco) if (n.attrs.class === 'beam') n.attrs.opacity = r2(0.55 * work);
  const clipGroup = el('g', { 'clip-path': `url(#${id}k)` }, pdecoClip);
  const figChildren: SvgNode[] = [
    el('g', { class: 'back' }, back),
    body,
    el('g', { class: 'front' }, front),
    // Partial coverage moves the veil under the clipped deco (Mend's seam sits over the crown)
    ...(o.cover ? [veil, clipGroup] : [clipGroup, veil]),
    el('g', { class: 'visor' }, [
      el('rect', {
        x: vx,
        y: vy,
        width: vw,
        height: vh,
        rx: vr,
        fill: `url(#${id}vg)`,
        stroke: dk,
        'stroke-width': 1.4,
      }),
      el('rect', {
        x: vx,
        y: vy + 1.4,
        width: vw,
        height: vh,
        rx: vr,
        fill: 'none',
        stroke: '#04060B',
        'stroke-opacity': '.55',
        'stroke-width': 3,
        'clip-path': `url(#${id}c)`,
      }),
      el('path', {
        d: `M${r2(vx + vr * 0.7)} ${r2(lipY)}Q${vx + vw / 2} ${r2(lipY + 1.8)} ${r2(vx + vw - vr * 0.7)} ${r2(lipY)}`,
        fill: 'none',
        stroke: mix(col, '#ffffff', 0.6),
        'stroke-opacity': '.5',
        'stroke-width': 1.2,
        'stroke-linecap': 'round',
      }),
      el('ellipse', {
        class: 'vglow',
        cx: vx + vw / 2,
        cy: vy + vh / 2,
        rx: vw * 0.42,
        ry: vh * 0.5,
        fill: `url(#${id}eg)`,
        opacity: r2(bo * 0.8),
      }),
      el('path', {
        d: `M${r2(vx + vh * 0.42)} ${r2(vy + 4.2)}Q${r2(vx + vw * 0.3)} ${r2(vy + 2.7)} ${r2(vx + vw * 0.46)} ${r2(vy + 3.6)}`,
        fill: 'none',
        stroke: '#fff',
        'stroke-opacity': '.2',
        'stroke-width': 2.2,
        'stroke-linecap': 'round',
      }),
    ]),
    el('g', { class: 'eyes', opacity: bo }, [
      el('path', {
        class: 'eg',
        d: d0,
        fill: ecol,
        stroke: ecol,
        'stroke-width': 2.6,
        'stroke-linejoin': 'round',
        opacity: '.2',
      }),
      el('path', {
        class: 'ef',
        d: d0,
        fill: ecol,
        stroke: ecol,
        'stroke-width': r2(0.25 * vh * 0.17),
        'stroke-linejoin': 'round',
      }),
    ]),
    el(
      'g',
      { class: 'props', opacity: propScale },
      P ? [el('g', pa, [el('g', { class: 'pv' }, pv), ...pdeco])] : [],
    ),
  ];

  const defs = el('defs', {}, [
    el('radialGradient', { id: `${id}g`, cx: '.36', cy: '.26', r: '.9' }, [
      el('stop', { offset: '0', 'stop-color': lt }),
      el('stop', { offset: '.55', 'stop-color': col }),
      el('stop', { offset: '1', 'stop-color': dk }),
    ]),
    el('clipPath', { id: `${id}k` }, [el('path', { d: S.d })]),
    el('clipPath', { id: `${id}c` }, [el('rect', { x: vx, y: vy, width: vw, height: vh, rx: vr })]),
    el('linearGradient', { id: `${id}vg`, x1: '0', y1: '0', x2: '0', y2: '1' }, [
      el('stop', { offset: '0', 'stop-color': '#3A4258' }),
      el('stop', { offset: '.5', 'stop-color': '#1B2030' }),
      el('stop', { offset: '1', 'stop-color': '#11141E' }),
    ]),
    el('radialGradient', { id: `${id}eg` }, [
      el('stop', { offset: '0', 'stop-color': ecol, 'stop-opacity': '.55' }),
      el('stop', { offset: '1', 'stop-color': ecol, 'stop-opacity': '0' }),
    ]),
    el('radialGradient', { id: `${id}s` }, [
      el('stop', { offset: '0', 'stop-color': '#2A2838' }),
      el('stop', { offset: '.55', 'stop-color': '#2A2838', 'stop-opacity': '.45' }),
      el('stop', { offset: '1', 'stop-color': '#2A2838', 'stop-opacity': '0' }),
    ]),
    el('clipPath', { id: `${id}v` }, [
      el('rect', { class: 'veilr', x: -20, y: -30, width: 160, height: Math.max(0, veilH) }),
    ]),
  ]);

  return {
    width: size,
    height: Math.round((size * 128) / 136),
    state: st,
    ghosting: box || st === 'invite' || (o.cover && st !== 'off'),
    veiled: box || st === 'invite',
    children: [
      defs,
      ...shadow,
      el(
        'g',
        {
          class: 'fig',
          transform: `translate(60 ${r2(108 + ty)}) rotate(0) scale(1 1) translate(-60 -108)`,
          opacity: r2(figOp),
        },
        figChildren,
      ),
    ],
    layers,
  };
}

/** The page's bake size for a layer: ⌈region R × size / 136 × min(2, DPR)⌉ (makeChar, o.res = 1). */
export const bakeSize = (R: number, size: number, dpr: number) =>
  Math.ceil(R * (size / 136) * Math.min(2, dpr || 1));

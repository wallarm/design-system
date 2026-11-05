// glyph() of the reference page (look v14): the flat 16–32 px character as an SVG string.
import { hexOf, luma, mix } from './color';
import { type AgentToneId, GLYPH_PROPS, TONE } from './data.gen';
import { eyesPath, eyeTargets, type StateId } from './eyes';
import { geom, optPx, shapeOf } from './geom';
import { r2 } from './paths';
import { propOf } from './propOf';
import { type SvgNode, toSvgString } from './svg';

export interface Look {
  shape: string;
  color: string;
  eyes: string;
  prop: string;
}

let GUID = 0; // page-style clip ids, only for glyph(): components pass their own (useId)

export interface GlyphTree {
  width: number;
  height: number;
  /** the optical lift in px (optPx): negative moves the character up */
  oy: number;
  /** whole-SVG opacity (Not set up) */
  opacity?: number;
  children: SvgNode[];
}

/** The flat 16–32 px character as nodes. `clipId` names the Partial coverage crown's clip (unique per document). */
export function glyphTree(c: Look, size: number, state: StateId, clipId: string): GlyphTree {
  const S = shapeOf(c.shape);
  const col = hexOf(c.color);
  const [vx, vy, vw, vh] = S.v;
  const vr = vh * 0.46;
  // "Inviting": solid primer grey, eyes lit at .6, no prop; "Partial coverage": On duty with a grey crown.
  const ghost = state === 'box';
  const off = state === 'off';
  const inv = state === 'invite';
  const pt = state === 'partly';
  const st = pt ? 'idle' : state;
  const fc = ghost || inv ? '#C9CED6' : off ? mix(col, '#B8BCC4', 0.6) : col;
  const sw = r2((1 * 136) / size);
  const pc = (p: { tone: AgentToneId }) => (ghost || inv ? '#C9CED6' : TONE[p.tone]);
  const parts = S.parts || [];
  const L = (d: string, f: string): SvgNode => ({
    tag: 'path',
    attrs: {
      d,
      fill: f,
      stroke: mix(f, '#0d0b0c', 0.28),
      'stroke-width': sw,
      'stroke-linejoin': 'round',
    },
  });
  const out: SvgNode[] = [
    ...parts.filter(p => p.z === 'b').map(p => L(p.d, pc(p))),
    L(S.d, fc),
    ...parts.filter(p => p.z !== 'b').map(p => L(p.d, pc(p))),
  ];
  if (pt) {
    // the top of the silhouette, clipped at the line and redrawn in grey with its rim
    const ct = geom(S).top[1];
    const cy = Math.min(ct + 0.3 * (108 - ct), vy - 4);
    out.push(
      {
        tag: 'clipPath',
        attrs: { id: clipId },
        children: [{ tag: 'rect', attrs: { x: -20, y: -30, width: 160, height: r2(cy + 30) } }],
      },
      {
        tag: 'g',
        attrs: { 'clip-path': `url(#${clipId})` },
        children: [
          ...parts.filter(p => p.z === 'b').map(p => L(p.d, '#C9CED6')),
          L(S.d, '#C9CED6'),
          ...parts.filter(p => p.z !== 'b').map(p => L(p.d, '#C9CED6')),
        ],
      },
    );
  }
  if (!ghost) {
    out.push({
      tag: 'rect',
      attrs: { x: vx, y: vy, width: vw, height: vh, rx: vr, fill: '#16181D' },
    });
    const t = eyeTargets(c.eyes, st);
    const ec = c.color === 'coral' ? '#FF7A5E' : mix(col, '#ffffff', 0.62);
    const lsw = 0.25 * vh * 0.17;
    // eyeD() insets for a stroke: done arcs and failed dashes need it back
    const ln =
      st === 'done' || st === 'hello'
        ? lsw
        : st === 'failed'
          ? Math.max(lsw, (0.9 * 136) / size)
          : 0;
    out.push({
      tag: 'path',
      attrs: {
        d: eyesPath(S, t, 1, 0, t.gy),
        fill: ec,
        ...(ln ? { stroke: ec, 'stroke-width': r2(ln), 'stroke-linejoin': 'round' } : {}),
        opacity: inv ? 0.6 : off ? 0.35 : st === 'failed' ? 0.75 : 1,
      },
    });
  }
  if (!ghost && !inv && c.prop && GLYPH_PROPS.has(c.prop)) {
    // light layers get the rim, or they vanish on white
    for (const l of propOf(c.prop, S, col)?.layers ?? [])
      out.push(luma(l.col) > 190 ? L(l.d, l.col) : { tag: 'path', attrs: { d: l.d, fill: l.col } });
  }
  return {
    width: size,
    height: Math.round((size * 128) / 136),
    oy: optPx(c, size),
    ...(ghost ? { opacity: 0.55 } : {}),
    children: out,
  };
}

/** The page's glyph() string, byte for byte (parity tests and the side-by-side harness). */
export function glyph(c: Look, size: number, state: StateId = 'idle') {
  const t = glyphTree(c, size, state, `gc${state === 'partly' ? ++GUID : GUID}`);
  return toSvgString(
    'svg',
    {
      viewBox: '-8 -14 136 128',
      width: t.width,
      height: t.height,
      'aria-hidden': 'true',
      style: `--oy:${t.oy}px;display:block;${t.opacity ? 'opacity:.55' : ''}`,
    },
    t.children,
  );
}

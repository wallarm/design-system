// Looks: the checks for the combinations to avoid and the deterministic first look of an agent without a preset
// (handoff 02, «Combinations to avoid» and «Default look for a custom agent»; measurements/default-look.cjs).
import { type AgentLook, type AgentPropId, CAST, COLORS, EYE_STYLES, SHAPE_IDS } from './data.gen';

type Look = Omit<AgentLook, 'v'>;

export type LookIssueCode =
  | 'coral-not-wally'
  | 'dots-look-alike'
  | 'reads-as-wally'
  | 'glyph-twin'
  | 'sky-teal-same-shape';
/** Every code is a warning: the builder warns and never blocks; Random and the default look skip them all (D19). */
export interface LookIssue {
  code: LookIssueCode;
  level: 'warning';
}

/** The page's PRNG (mulberry32, reference line 1296). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The page's seed hash (reference line 1734). It iterates code points but reads charCodeAt(0), so an astral
 *  character counts by its high surrogate only, exactly as on the page. */
export const hash32 = (s: string) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7);

const BLUE = new Set(['cobalt', 'sky', 'powder', 'petrol']);

export function lookIssues(
  look: Look,
  { isWally, others }: { isWally: boolean; others: readonly Look[] },
): LookIssue[] {
  const out: LookIssueCode[] = [];
  if (look.color === 'coral' && !isWally) out.push('coral-not-wally');
  // no OpenAI Dots look-alikes
  if (
    (look.shape === 'cloud' && BLUE.has(look.color) && look.prop === 'beanie') ||
    (look.color === 'butter' && (look.prop === 'glasses' || look.prop === 'monocle')) ||
    ((look.color === 'mint' || look.color === 'sage') &&
      (look.shape === 'pebble' || look.shape === 'capsule' || look.shape === 'egg'))
  ) {
    out.push('dots-look-alike');
  }
  if (!isWally && look.shape === 'dome' && look.prop === 'antennae') out.push('reads-as-wally');
  for (const o of others) {
    if (o.shape === look.shape && o.color === look.color) out.push('glyph-twin');
    if (
      o.shape === look.shape &&
      ((o.color === 'sky' && look.color === 'cyan') || (o.color === 'cyan' && look.color === 'sky'))
    ) {
      out.push('sky-teal-same-shape');
    }
  }
  return out.map(code => ({ code, level: 'warning' }));
}

const PRESET_LOOKS: readonly Look[] = CAST.map(({ shape, color, eyes, prop }) => ({
  shape,
  color,
  eyes,
  prop,
}));
const DRAW_COLORS = COLORS.filter(c => !c.brand).map(c => c.id); // never coral

/**
 * A first look for an agent without a preset, the same on every client for the same uid.
 * `others`: the presets until looks can be stored (B3), then the tenant's stored looks.
 * `propPool`: no prop by default (P10), since a custom agent's job is not known.
 */
export function defaultLook(
  agentId: string,
  others: readonly Look[] = PRESET_LOOKS,
  propPool: readonly AgentPropId[] = ['none'],
): AgentLook {
  const r = rng(hash32(agentId));
  const pick = <T>(list: readonly T[]) => list[Math.floor(r() * list.length)] as T;
  const draw = (): AgentLook => ({
    v: 1,
    shape: pick(SHAPE_IDS),
    color: pick(DRAW_COLORS),
    eyes: pick(EYE_STYLES),
    prop: propPool.length ? pick(propPool) : 'none',
  });
  const first = draw();
  if (lookIssues(first, { isWally: false, others }).length === 0) return first;
  for (let i = 1; i < 200; i++) {
    const look = draw();
    if (lookIssues(look, { isWally: false, others }).length === 0) return look;
  }
  // 200 draws all had an issue: keep the first, so the result stays deterministic (never reached in the handoff run).
  return first;
}

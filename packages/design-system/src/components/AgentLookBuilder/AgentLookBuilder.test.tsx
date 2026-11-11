import { afterAll, beforeAll, describe, expect, it, rstest } from '@rstest/core';
import { render } from '@testing-library/react';
import fixture from '../../lib/agent-characters/__tests__/__fixtures__/builder-v17.json';
import { normalise } from '../../lib/agent-characters/__tests__/normaliseSvg';
import { charTree } from '../../lib/agent-characters/char';
import { glyph } from '../../lib/agent-characters/glyph';
import { setPropLibrary } from '../../lib/agent-characters/propOf';
import { type SvgNode, toSvgString } from '../../lib/agent-characters/svg';
import { AgentAvatar } from '../AgentAvatar';
import { AgentGlyph } from '../AgentGlyph';
import {
  AGENT_COLORS,
  AGENT_EYES,
  AGENT_PROPS,
  AGENT_SHAPES,
  defaultLook,
  enableAgentLookLibrary,
  lookIssues,
} from './index';

type Look = { shape: string; color: string; eyes: string; prop: string };
type Case = {
  kind: string;
  look: Look;
  size: number;
  state: 'idle';
  shadow: boolean;
  cover: boolean;
  svg: string;
  jobs: { d: string; col: string; mat: string; veil: boolean }[];
};
const cases = fixture.cases as Case[];
const glyphs = fixture.glyphs as {
  look: Look;
  size: number;
  state: 'idle' | 'partly';
  svg: string;
}[];
const normIds = (s: string) => {
  const seen = new Map<string, string>();
  return s.replace(/gc\d+/g, m => {
    if (!seen.has(m)) seen.set(m, `gc#${seen.size}`);
    return seen.get(m) as string;
  });
};
const name = (l: Look) => `${l.shape} ${l.color} ${l.eyes} ${l.prop}`;

describe('AgentLookBuilder kit', () => {
  it('lists every shape, colour, eye style and prop with display names', () => {
    expect(AGENT_SHAPES).toHaveLength(12);
    expect(AGENT_SHAPES[0]).toEqual({ id: 'dome', name: expect.any(String), family: 'soft' });
    expect(AGENT_SHAPES.find(s => s.id === 'safe')?.family).toBe('object');
    expect(AGENT_COLORS).toHaveLength(22);
    expect(AGENT_COLORS.find(c => c.id === 'coral')).toMatchObject({ group: 'brand', brand: true });
    expect(AGENT_COLORS.find(c => c.id === 'cyan')?.name).toBe('teal');
    expect(AGENT_COLORS.filter(c => c.brand).map(c => c.id)).toEqual(['coral']);
    expect(AGENT_EYES.map(e => e.id)).toEqual(['round', 'oval', 'tall', 'sleepy']);
    expect(AGENT_PROPS).toHaveLength(17);
    expect(AGENT_PROPS.find(p => p.id === 'antennae')).toEqual({
      id: 'antennae',
      name: expect.any(String),
      glyph: true,
    });
    expect(AGENT_PROPS.find(p => p.id === 'seam')?.glyph).toBe(false);
  });

  it('flags coral for anyone but Wally (D22) and draws default looks from a prop pool', () => {
    const coral = { shape: 'egg', color: 'coral', eyes: 'oval', prop: 'none' } as const;
    expect(lookIssues(coral, { isWally: false, others: [] }).map(i => i.code)).toContain(
      'coral-not-wally',
    );
    const looks = Array.from({ length: 40 }, (_, i) =>
      defaultLook(`agent-${i}`, [], ['beanie', 'sprout']),
    );
    expect(new Set(looks.map(l => l.prop))).toEqual(new Set(['beanie', 'sprout']));
    expect(looks.some(l => l.color === 'coral')).toBe(false);
  });
});

describe('enableAgentLookLibrary', () => {
  afterAll(() => setPropLibrary(null));

  it('draws the prop for characters rendered after it, and mounted ones keep working (glyphs update)', () => {
    setPropLibrary(null);
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => {});
    const look = { v: 1, shape: 'kettle', color: 'butter', eyes: 'oval', prop: 'beanie' } as const;
    const paths = (id: string) => document.querySelectorAll(`[data-testid="${id}"] path`).length;
    const { rerender } = render(
      <>
        <AgentGlyph look={look} size={24} data-testid='g1' />
        <AgentAvatar look={look} size={72} seed='a' data-testid='a1' />
      </>,
    );
    const before = { g: paths('g1'), a: paths('a1') };
    expect(warn).toHaveBeenCalledTimes(1); // one look, one warning, though drawn twice
    enableAgentLookLibrary();
    rerender(
      <>
        <AgentGlyph look={look} size={24} data-testid='g1' />
        <AgentAvatar look={look} size={72} seed='a' data-testid='a1' />
        <AgentGlyph look={look} size={24} data-testid='g2' />
        <AgentAvatar look={look} size={72} seed='b' data-testid='a2' />
      </>,
    );
    expect(paths('g2')).toBeGreaterThan(before.g);
    expect(paths('a2')).toBeGreaterThan(before.a);
    // a mounted glyph picks it up on its next render; a mounted 3D character keeps its drawing until its look
    // changes or it remounts
    expect(paths('g1')).toBe(paths('g2'));
    expect(paths('a1')).toBe(before.a);
    warn.mockRestore();
  });
});

describe('AgentLookBuilder parity with the reference builder (look v17)', () => {
  beforeAll(() => enableAgentLookLibrary());
  afterAll(() => setPropLibrary(null));

  for (const k of cases)
    it(`draws the ${k.kind} look ${name(k.look)} @${k.size}${k.cover ? ' partial' : ''}`, () => {
      const t = charTree(k.look, {
        size: k.size,
        state: k.state,
        shadow: k.shadow,
        cover: k.cover,
        ids: 'k1',
      });
      const mine = toSvgString(
        'svg',
        { viewBox: '-8 -14 136 128', width: t.width, height: t.height },
        t.children,
      );
      expect(normalise(mine)).toBe(normalise(k.svg));
      // bake jobs in document order, as the page lists them
      const order: number[] = [];
      const walk = (n: SvgNode) => {
        if (n.attrs['data-j'] !== undefined) order.push(Number(n.attrs['data-j']));
        for (const ch of n.children ?? []) walk(ch);
      };
      for (const n of t.children) walk(n);
      expect(order.map(j => t.layers[j])).toEqual(k.jobs);
    });

  it('draws every captured glyph', () => {
    for (const g of glyphs)
      expect(normIds(glyph(g.look, g.size, g.state)), `${name(g.look)} ${g.state} @${g.size}`).toBe(
        normIds(g.svg),
      );
  });
});

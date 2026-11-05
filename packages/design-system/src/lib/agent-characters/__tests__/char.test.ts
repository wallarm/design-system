import { describe, expect, it } from '@rstest/core';
import { bakeSize, charTree } from '../char';
import { CAST } from '../data.gen';
import type { StateId } from '../eyes';
import { type SvgNode, toSvgString } from '../svg';
import fixture from './__fixtures__/char-v14.json';
import { normalise } from './normaliseSvg';

type Case = {
  id: string;
  size: number;
  state: StateId;
  shadow: boolean;
  cover: boolean;
  svg: string;
  jobs: { d: string; col: string; mat: string; P: number; veil: boolean }[];
};
const regions = fixture.regions as Record<string, [number, number, number]>;

describe('charTree (static 3D character)', () => {
  for (const k of fixture.cases as Case[]) {
    const name = `${k.id} ${k.state}${k.cover ? ' partial' : ''} @${k.size}`;
    it(`matches the page for ${name}`, () => {
      const c = CAST.find(p => p.id === k.id);
      if (!c) throw new Error(k.id);
      const t = charTree(c, {
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
      expect(order.map(j => t.layers[j])).toEqual(k.jobs.map(({ P: _P, ...j }) => j));
      // and the page's bake size for each layer, from its region at the capture's DPR
      expect(
        k.jobs.map(j =>
          bakeSize((regions[j.d] as [number, number, number])[2], k.size, fixture.dpr),
        ),
      ).toEqual(k.jobs.map(j => j.P));
      const pageCls = (k.svg.match(/^<svg class="([^"]+)"/)?.[1] ?? '').split(' ');
      expect({ ghosting: t.ghosting, veiled: t.veiled }).toEqual({
        ghosting: pageCls.includes('ghosting'),
        veiled: pageCls.includes('veiled'),
      });
    });
  }
});

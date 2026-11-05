import { describe, expect, it } from '@rstest/core';
import { CAST, SHAPE_IDS } from '../data.gen';
import type { StateId } from '../eyes';
import { geom, optY, shapeOf } from '../geom';
import { glyph } from '../glyph';
import fixture from './__fixtures__/v14.json';

// WDS-197: the glyph path reads geometry from data, never from a canvas (SSR, consumers' jsdom tests).
// Its own file, so no other test has primed the geometry cache.
const glyphs = fixture.glyphs as Record<string, string>;
const normIds = (s: string) => {
  const seen = new Map<string, string>();
  return s.replace(/gc\d+/g, m => {
    if (!seen.has(m)) seen.set(m, `gc#${seen.size}`);
    return seen.get(m) as string;
  });
};

describe('glyph without a canvas', () => {
  it('draws every cast glyph from data alone', () => {
    const proto = HTMLCanvasElement.prototype as unknown as { getContext: () => never };
    const saved = proto.getContext;
    proto.getContext = () => {
      throw new Error('canvas used');
    };
    try {
      for (const c of CAST)
        for (const st of ['idle', 'partly', 'failed', 'box', 'invite'] as StateId[])
          expect(normIds(glyph(c, 20, st)), `${c.id} ${st}`).toBe(
            normIds(glyphs[`${c.id}|${st}|20`] as string),
          );
    } finally {
      proto.getContext = saved;
    }
  });

  it('ships the page geometry for all 12 shapes, and draws looks outside the cast', () => {
    const proto = HTMLCanvasElement.prototype as unknown as { getContext: () => never };
    const saved = proto.getContext;
    proto.getContext = () => {
      throw new Error('canvas used');
    };
    try {
      const geoms = fixture.geoms as Record<
        string,
        { top: number[]; HW: number[]; foot: number[]; optY: number }
      >;
      for (const id of SHAPE_IDS) {
        const g = geom(shapeOf(id));
        const want = geoms[id];
        expect([g.top, Array.from(g.HW), g.foot], id).toEqual([want?.top, want?.HW, want?.foot]);
        expect(optY({ shape: id }), id).toBe(want?.optY);
      }
      for (const c of fixture.extraLooks as {
        shape: string;
        color: string;
        eyes: string;
        prop: string;
      }[])
        for (const st of ['idle', 'partly', 'invite'] as StateId[])
          expect(normIds(glyph(c, 24, st)), `${c.shape} ${st}`).toBe(
            normIds(glyphs[`${c.shape}+${c.prop}|${st}|24`] as string),
          );
    } finally {
      proto.getContext = saved;
    }
  });

  it('draws ids outside the kit as the page does: dome, cobalt, oval, no prop', () => {
    const odd = glyph(
      { shape: 'teapot', color: 'ultraviolet', eyes: 'square', prop: 'hat' },
      20,
      'idle',
    );
    expect(odd).toBe(
      glyph({ shape: 'dome', color: 'cobalt', eyes: 'oval', prop: 'none' }, 20, 'idle'),
    );
  });
});

import { beforeAll, describe, expect, it, rstest } from '@rstest/core';
import cast from '../../../../scripts/agent-avatars/data/cast.json';
import { hexOf, mix } from '../color';
import { SHAPES } from '../data.gen';
import { eyesPath, eyeTargets, helloPop, type StateId } from '../eyes';
import { type Geom, optY, primeGeom, SHAPE } from '../geom';
import { glyph } from '../glyph';
import { setPropLibrary } from '../propOf';
import { propDef } from '../props';
import fixture from './__fixtures__/v17.json';
import { PAGE_CAST } from './pageCast';

type FixtureGeom = { top: [number, number]; HW: number[]; foot: [number, number]; optY: number };
const geoms = fixture.geoms as Record<string, FixtureGeom>;
const eyes = fixture.eyes as Record<string, string>;
const props = fixture.props as Record<string, ReturnType<typeof propDef>>;
const glyphs = fixture.glyphs as Record<string, string>;
const extraLooks = fixture.extraLooks as {
  shape: string;
  color: string;
  eyes: string;
  prop: string;
}[];

// geom() rasterises with a canvas, which jsdom lacks: the reference's own geometry is primed instead.
// The real canvas path is checked side by side in the parity harness.
beforeAll(() => {
  for (const [id, g] of Object.entries(geoms))
    primeGeom(id, { top: g.top, HW: Float32Array.from(g.HW), foot: g.foot } satisfies Geom);
});

// Glyph clip ids come from a page-wide counter; compare them by position, not by number.
const normIds = (s: string) => {
  const seen = new Map<string, string>();
  return s.replace(/gc\d+/g, m => {
    if (!seen.has(m)) seen.set(m, `gc#${seen.size}`);
    return seen.get(m) as string;
  });
};

describe('port of the reference (look v17)', () => {
  it('optY matches for every shape', () => {
    for (const S of SHAPES) expect(optY({ shape: S.id })).toBe(geoms[S.id].optY);
  });

  it('eyesPath matches for every style × state on three shapes', () => {
    for (const [key, d] of Object.entries(eyes)) {
      const [shape, style, st, variant] = key.split('|');
      const S = SHAPE[shape];
      if (variant) {
        expect(eyesPath(S, eyeTargets(style, st as StateId), 0.3, 0.4, -0.2), key).toBe(d);
      } else if (st === 'pop') {
        const t = helloPop(eyeTargets(style, 'idle'));
        expect(eyesPath(S, t, 1, 0, t.gy), key).toBe(d);
      } else {
        const t = eyeTargets(style, st as StateId);
        expect(eyesPath(S, t, 1, 0, t.gy), key).toBe(d);
      }
    }
  });

  it('propDef matches for every prop on every shape', () => {
    for (const [key, def] of Object.entries(props)) {
      const [kind, shape] = key.split('|');
      expect(propDef(kind, SHAPE[shape], '#9A7FE0'), key).toEqual(def);
    }
  });

  it('glyph matches for the cast in every state and size', () => {
    for (const c of PAGE_CAST)
      for (const key of Object.keys(glyphs).filter(k => k.startsWith(`${c.id}|`))) {
        const [, st, size] = key.split('|');
        expect(normIds(glyph(c, Number(size), st as StateId)), key).toBe(normIds(glyphs[key]));
      }
  });

  it('glyph matches for looks outside the cast, only with the builder library (WDS-204)', () => {
    const keysOf = (c: (typeof extraLooks)[number]) =>
      Object.keys(glyphs).filter(
        k => k.startsWith(`${c.shape}+${c.prop}|`) && k.includes('|idle|'),
      );
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => {});
    const without = extraLooks.flatMap(keysOf).filter(key => {
      const c = extraLooks.find(x => key.startsWith(`${x.shape}+${x.prop}|`))!;
      return normIds(glyph(c, 24, 'idle')) !== normIds(glyphs[key]);
    });
    warn.mockRestore();
    expect(without.length).toBeGreaterThan(0);
    setPropLibrary(propDef);
    try {
      for (const c of extraLooks)
        for (const key of Object.keys(glyphs).filter(k => k.startsWith(`${c.shape}+${c.prop}|`))) {
          const st = key.split('|')[1];
          expect(normIds(glyph(c, 24, st as StateId)), key).toBe(normIds(glyphs[key]));
        }
    } finally {
      setPropLibrary(null);
    }
  });

  // An independent source: the handoff's own export of the page output (data/cast.json «resolved»).
  it('agrees with the handoff export for the cast', () => {
    const resolved = cast.resolved.byPreset as Record<
      string,
      { bodyColor: string; eyeColor: string; idleEyesPath: string; prop: unknown; glyph20: string }
    >;
    for (const c of PAGE_CAST) {
      const r = resolved[c.id]!;
      const S = SHAPE[c.shape];
      const col = hexOf(c.color);
      expect(col, c.id).toBe(r.bodyColor);
      expect(c.color === 'coral' ? '#FF7A5E' : mix(col, '#ffffff', 0.62), c.id).toBe(r.eyeColor);
      expect(eyesPath(S, eyeTargets(c.eyes, 'idle'), 1), c.id).toBe(r.idleEyesPath);
      expect(propDef(c.prop, S, col), c.id).toEqual(r.prop);
      expect(glyph(c, 20, 'idle'), c.id).toBe(r.glyph20);
    }
  });
});

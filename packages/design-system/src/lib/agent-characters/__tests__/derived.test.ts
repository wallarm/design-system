import { describe, expect, it } from '@rstest/core';
import colorsJson from '../../../../scripts/agent-avatars/data/colors.json';
import statesJson from '../../../../scripts/agent-avatars/data/states.json';
import { hexOf, luma, mix } from '../color';
import { EYE_STYLES } from '../data.gen';
import { eyeTargets, helloPop, type StateId } from '../eyes';
import { glyph } from '../glyph';

// WDS-197 acceptance: every derived value in data/*.json comes out of the port unchanged.
const r4 = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 1e4) / 1e4]));

describe('derived values (Look Demo v5 data)', () => {
  it('per-colour derivations', () => {
    const by = colorsJson.derived.byColor as Record<string, Record<string, string | number>>;
    for (const [id, d] of Object.entries(by)) {
      const hex = hexOf(id);
      expect(id === 'coral' ? '#FF7A5E' : mix(hex, '#ffffff', 0.62), `${id} eye`).toBe(d.eye);
      expect(mix(hex, '#0d0b0c', 0.34), `${id} bodyDark`).toBe(d.bodyDark);
      expect(mix(hex, '#ffffff', 0.4), `${id} bodyLight`).toBe(d.bodyLight);
      expect(mix(hex, '#ffffff', 0.6), `${id} visorLip`).toBe(d.visorLip);
      expect(mix(hex, '#0d0b0c', 0.28), `${id} glyphRim`).toBe(d.glyphRim);
      expect(mix(hex, '#B8BCC4', 0.6), `${id} glyphOffFill`).toBe(d.glyphOffFill);
      if (typeof d.luma === 'number')
        expect(Math.round(luma(hex) * 100) / 100, `${id} luma`).toBeCloseTo(d.luma, 1);
    }
  });

  it('eye targets for every style and state, and the Hello pop', () => {
    const by = statesJson.eyeTargets.byStyle as Record<
      string,
      Record<string, Record<string, number>>
    >;
    for (const style of EYE_STYLES) {
      for (const [st, want] of Object.entries(by[style] ?? {})) {
        const s = (st === 'partly' ? 'idle' : st) as StateId;
        expect(r4({ ...eyeTargets(style, s) }), `${style} ${st}`).toEqual(want);
      }
      const pop = (statesJson.helloPop.byStyle as Record<string, Record<string, number>>)[style];
      expect(r4({ ...helloPop(eyeTargets(style, 'idle')) }), `${style} pop`).toEqual(pop);
    }
  });

  it('glyph literals and eye opacity per state', () => {
    const fx = colorsJson.fixed;
    const look = { shape: 'egg', color: 'olive', eyes: 'round', prop: 'none' };
    expect(glyph(look, 24, 'idle')).toContain(`fill="${fx.glyphVisor}"`);
    expect(glyph(look, 24, 'box')).toContain(`fill="${fx.glyphGhost}"`);
    expect(glyph(look, 24, 'off')).toContain(`fill="${mix(hexOf('olive'), fx.glyphOffMix, 0.6)}"`);
    const byState = statesJson.glyph.byState as Record<string, { eyeOpacity?: number }>;
    for (const [st, g] of Object.entries(byState)) {
      if (typeof g.eyeOpacity !== 'number') continue;
      expect(glyph(look, 24, st as StateId), st).toContain(`opacity="${g.eyeOpacity}"`);
    }
  });
});

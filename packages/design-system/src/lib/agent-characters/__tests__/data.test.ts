import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from '@rstest/core';

import cast from '../../../../scripts/agent-avatars/data/cast.json';
import colors from '../../../../scripts/agent-avatars/data/colors.json';
import eyesJson from '../../../../scripts/agent-avatars/data/eyes.json';
import optical from '../../../../scripts/agent-avatars/data/optical.json';
import propsJson from '../../../../scripts/agent-avatars/data/props.json';
import shapes from '../../../../scripts/agent-avatars/data/shapes.json';
import { generate } from '../../../../scripts/agent-avatars/export-data';
import {
  type AgentColorId,
  type AgentLook,
  type AgentPropId,
  type AgentShapeId,
  CAST,
  COLOR_IDS,
  COLORS,
  EYE_BASE,
  EYE_STYLES,
  GLYPH_PROPS,
  HARD,
  OPTY,
  PROP_IDS,
  PROPS,
  SHAPE_IDS,
  SHAPES,
  SPRINGS,
  STATES,
  TONE,
} from '../data.gen';

describe('agent character data (look v17)', () => {
  it('has the kit sizes', () => {
    expect(SHAPES).toHaveLength(12);
    expect(COLORS).toHaveLength(22);
    expect(PROPS).toHaveLength(17);
    expect(CAST).toHaveLength(7);
    expect(STATES.map(s => s.key)).toEqual([
      'idle',
      'hello',
      'working',
      'needs',
      'done',
      'failed',
      'off',
      'box',
      'invite',
      'partly',
    ]);
  });

  it('keeps shapes verbatim, parts included', () => {
    expect(SHAPES).toEqual(shapes.shapes);
  });

  it('keeps page ids (cyan stays cyan)', () => {
    expect(COLORS.find(c => c.id === 'cyan')?.hex).toBe('#2BA6BF');
    expect(COLORS).toEqual(colors.colors);
  });

  it('maps presets to their look', () => {
    expect(CAST.find(p => p.id === 'trim')).toMatchObject({
      shape: 'capsule',
      color: 'cyan',
      eyes: 'oval',
      prop: 'windkey',
    });
    expect(CAST.find(p => p.id === 'bard')).toMatchObject({
      shape: 'cloud',
      color: 'powder',
      eyes: 'oval',
      prop: 'quill',
    });
  });

  it("ships the cast as of 10.11: Acquit with Mend's look, Lens and Bard, no Probe (WDS-205)", () => {
    expect(CAST.map(p => p.id)).toEqual([
      'wally',
      'radar',
      'sift',
      'acquit',
      'trim',
      'lens',
      'bard',
    ]);
    const mend = cast.presets.find(p => p.id === 'mend');
    expect(CAST.find(p => p.id === 'acquit')).toMatchObject({
      name: 'Acquit',
      role: mend?.role,
      shape: mend?.shape,
      color: mend?.color,
      eyes: mend?.eyes,
      prop: mend?.prop,
    });
  });

  it('carries tones, hard tones, eye bases, springs, glyph props and optY', () => {
    expect(TONE).toEqual(colors.tones.values);
    expect([...HARD]).toEqual(colors.tones.hardTones);
    expect(EYE_BASE.sleepy.lid).toBe(0.5);
    expect(SPRINGS.P_SHAPE).toEqual({ T: 0.28, zeta: 0.8 });
    expect(GLYPH_PROPS.has('antennae')).toBe(true);
    expect(GLYPH_PROPS.has('glasses')).toBe(false);
    expect(GLYPH_PROPS.has('quill')).toBe(true);
    expect(OPTY.dome).toBe(optical.shapes.dome.optY);
  });

  it('generated module is up to date with the vendored data', () => {
    expect(generate()).toBe(readFileSync(path.resolve(__dirname, '../data.gen.ts'), 'utf8'));
  });

  it('generates id lists equal to the data, and typed looks', () => {
    expect(SHAPE_IDS).toEqual(shapes.shapes.map(x => x.id));
    expect(COLOR_IDS).toEqual(colors.colors.map(x => x.id));
    expect(EYE_STYLES).toEqual(Object.keys(eyesJson.base));
    expect(PROP_IDS).toEqual(propsJson.props.map(x => x.id));
    const look: AgentLook = { v: 1, shape: 'kettle', color: 'cyan', eyes: 'sleepy', prop: 'none' };
    const ids: [AgentShapeId, AgentColorId, AgentPropId] = [look.shape, look.color, look.prop];
    expect(ids).toEqual(['kettle', 'cyan', 'none']);
  });

  it('carries each preset template id (null for Wally and agents without a template yet)', () => {
    expect(Object.fromEntries(CAST.map(p => [p.id, p.templateId]))).toEqual({
      wally: null,
      radar: 'attack-anomaly-investigation',
      sift: 'fp-marking',
      acquit: 'fp-resolver',
      trim: 'ruleset-optimizer',
      lens: null,
      bard: null,
    });
  });

  it('refuses to generate when the shipped geometry was measured on another outline', () => {
    const real = (name: string) =>
      JSON.parse(
        readFileSync(
          path.resolve(__dirname, `../../../../scripts/agent-avatars/data/${name}.json`),
          'utf8',
        ),
      );
    const edited = (name: string) => {
      const d = real(name);
      if (name === 'shapes') d.shapes[0].d = d.shapes[0].d.replace('M16 100', 'M17 100');
      return d;
    };
    expect(() => generate(edited)).toThrow(/geom\.json.*dome/);
  });
});

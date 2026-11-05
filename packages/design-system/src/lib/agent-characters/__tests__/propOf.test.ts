import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { hexOf } from '../color';
import { CAST, PRESET_PROPS } from '../data.gen';
import { shapeOf } from '../geom';
import { propOf, setPropLibrary } from '../propOf';
import { propDef } from '../props';

afterEach(() => {
  setPropLibrary(null);
  rstest.restoreAllMocks();
});

describe('propOf (WDS-204)', () => {
  it('ships the six presets as data equal to propDef', () => {
    expect(Object.keys(PRESET_PROPS)).toHaveLength(CAST.length);
    for (const c of CAST) {
      const col = hexOf(c.color);
      expect(propOf(c.prop, shapeOf(c.shape), col), c.id).toEqual(
        propDef(c.prop, shapeOf(c.shape), col),
      );
    }
  });

  it('draws no library prop without the builder entry and warns once per look', () => {
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => {});
    const S = shapeOf('dome');
    expect(propOf('beanie', S, hexOf('cobalt'))).toBeNull();
    expect(propOf('beanie', S, hexOf('cobalt'))).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/beanie.*AgentLookBuilder/);
  });

  it('never warns for no prop', () => {
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(propOf('none', shapeOf('mug'), hexOf('sand'))).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('uses the registered library for any look once it is set', () => {
    setPropLibrary(propDef);
    const S = shapeOf('kettle');
    expect(propOf('periscope', S, hexOf('plum'))).toEqual(propDef('periscope', S, hexOf('plum')));
  });

  // 07 §6.5: one registry per document, so a host's enableAgentLookLibrary() reaches a remote's DS copy.
  it('shares the registered library across module copies', async () => {
    setPropLibrary(propDef);
    rstest.resetModules();
    const other = await import('../propOf');
    const S = shapeOf('mug');
    expect(other.propOf('sprout', S, hexOf('olive'))).toEqual(propDef('sprout', S, hexOf('olive')));
    other.setPropLibrary(null);
    expect(propOf('sprout', S, hexOf('olive'))).toBeNull();
  });
});

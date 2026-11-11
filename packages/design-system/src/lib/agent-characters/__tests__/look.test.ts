import { describe, expect, it } from '@rstest/core';

import measured from '../../../../scripts/agent-avatars/data/default-look.json';
import { CAST, COLORS, SHAPE_IDS } from '../data.gen';
import { defaultLook, hash32, lookIssues, rng } from '../look';

// The ids measurements/default-look.cjs generates: UUID v4 format from a fixed seed.
const handoffIds = () => {
  const g = rng(20261104);
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(g() * 16).toString(16)).join('');
  return Array.from(
    { length: 5000 },
    () => `${hex(8)}-${hex(4)}-4${hex(3)}-${'89ab'[Math.floor(g() * 4)]}${hex(3)}-${hex(12)}`,
  );
};
const codes = (
  look: Parameters<typeof lookIssues>[0],
  isWally = false,
  others = [] as Parameters<typeof lookIssues>[1]['others'],
) => lookIssues(look, { isWally, others }).map(i => i.code);

describe('defaultLook', () => {
  it('reproduces the handoff run on its 5,000 ids', () => {
    const pairs = new Set<string>();
    for (const id of handoffIds()) {
      const a = defaultLook(id);
      expect(defaultLook(id)).toEqual(a);
      expect(lookIssues(a, { isWally: false, others: CAST })).toEqual([]);
      pairs.add(`${a.shape}/${a.color}`);
    }
    const all = SHAPE_IDS.flatMap(s => COLORS.filter(c => !c.brand).map(c => `${s}/${c.id}`));
    expect(pairs.size).toBe(measured.pairsUsed);
    expect(all.filter(k => !pairs.has(k))).toEqual(measured.pairsMissing);
  });

  it('is deterministic for any uid, never coral, and has no prop by default', () => {
    for (const id of ['', 'a', '😀-agent', 'deep-agent', '00000000-0000-4000-8000-000000000000']) {
      const look = defaultLook(id);
      expect(defaultLook(id)).toEqual(look);
      expect(look.v).toBe(1);
      expect(look.color).not.toBe('coral');
      expect(look.prop).toBe('none');
    }
  });

  it('hashes as the page does (pinned values)', () => {
    // values from the page's own hash32 (reference line 1734), evaluated in Node
    expect(hash32('')).toBe(7);
    expect(hash32('a')).toBe(314);
    expect(hash32('😀-agent')).toBe(106203022);
  });

  it('gives a prop even with an empty pool', () => {
    expect(defaultLook('x', undefined, []).prop).toBe('none');
  });
});

describe('lookIssues', () => {
  it('flags each rule, all as warnings', () => {
    expect(codes({ shape: 'egg', color: 'coral', eyes: 'oval', prop: 'none' })).toEqual([
      'coral-not-wally',
    ]);
    expect(codes({ shape: 'cloud', color: 'sky', eyes: 'oval', prop: 'beanie' })).toEqual([
      'dots-look-alike',
    ]);
    expect(codes({ shape: 'mug', color: 'butter', eyes: 'oval', prop: 'monocle' })).toEqual([
      'dots-look-alike',
    ]);
    expect(codes({ shape: 'egg', color: 'mint', eyes: 'oval', prop: 'none' })).toEqual([
      'dots-look-alike',
    ]);
    expect(codes({ shape: 'dome', color: 'pink', eyes: 'oval', prop: 'antennae' })).toEqual([
      'reads-as-wally',
    ]);
    const trim = CAST.find(p => p.id === 'trim');
    expect(
      codes(
        { shape: 'capsule', color: 'cyan', eyes: 'round', prop: 'none' },
        false,
        trim ? [trim] : [],
      ),
    ).toEqual(['glyph-twin']);
    expect(
      codes(
        { shape: 'capsule', color: 'sky', eyes: 'round', prop: 'none' },
        false,
        trim ? [trim] : [],
      ),
    ).toEqual(['sky-teal-same-shape']);
    expect(
      lookIssues(
        { shape: 'egg', color: 'coral', eyes: 'oval', prop: 'none' },
        { isWally: false, others: [] },
      )[0]?.level,
    ).toBe('warning');
  });

  it('lets Wally be coral and wear antennae on a dome', () => {
    expect(codes({ shape: 'dome', color: 'coral', eyes: 'oval', prop: 'antennae' }, true)).toEqual(
      [],
    );
  });

  it('does not throw on ids outside the kit', () => {
    const odd = {
      shape: 'teapot',
      color: 'ultraviolet',
      eyes: 'square',
      prop: 'hat',
    } as unknown as Parameters<typeof lookIssues>[0];
    expect(() => lookIssues(odd, { isWally: false, others: CAST })).not.toThrow();
  });
});

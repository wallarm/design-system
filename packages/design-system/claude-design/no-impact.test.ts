import { describe, expect, it } from '@rstest/core';
import { compareSnapshots, type PackageSnapshot } from './no-impact';

const base: PackageSnapshot = {
  packageJson: { exports: { '.': './dist/index.js' }, files: ['dist'], sideEffects: ['*.css'] },
  packFiles: ['dist/index.js', 'package.json'],
  dist: { 'dist/index.js': 'original' },
  fixtureBytes: 10000,
};
const allowlist = { distChanged: [], distAdded: [] };

describe('published-package impact', () => {
  it('accepts an identical snapshot', () => {
    expect(compareSnapshots(base, base, allowlist)).toEqual([]);
  });
  it('rejects export changes and unexpected additions, edits, and removals', () => {
    expect(compareSnapshots(base, { ...base, packageJson: {} }, allowlist)).toContain(
      'package.json public fields changed',
    );
    expect(
      compareSnapshots(base, { ...base, dist: { 'dist/index.js': 'changed' } }, allowlist),
    ).toContain('changed: dist/index.js');
    expect(compareSnapshots(base, { ...base, dist: {} }, allowlist)).toContain(
      'removed: dist/index.js',
    );
    expect(
      compareSnapshots(base, { ...base, packFiles: [...base.packFiles, 'secret.txt'] }, allowlist),
    ).toContain('pack added: secret.txt');
  });
  it('allows only explicitly declared module changes and new internal modules', () => {
    const next = {
      ...base,
      dist: { 'dist/index.js': 'changed', 'dist/lib/portal/Portal.js': 'new' },
      packFiles: [...base.packFiles, 'dist/lib/portal/Portal.js'],
    };
    expect(
      compareSnapshots(base, next, {
        distChanged: ['dist/index.js'],
        distAdded: ['dist/lib/portal/**'],
      }),
    ).toEqual([]);
    expect(
      compareSnapshots(base, { ...base, dist: {} }, { distChanged: ['**'], distAdded: ['**'] }),
    ).toContain('removed: dist/index.js');
  });
  it('rejects consumer size changes beyond one percent in either direction', () => {
    expect(compareSnapshots(base, { ...base, fixtureBytes: 10100 }, allowlist)).toEqual([]);
    expect(compareSnapshots(base, { ...base, fixtureBytes: 10101 }, allowlist)).toContain(
      'consumer bundle size changed by more than 1%',
    );
    expect(compareSnapshots(base, { ...base, fixtureBytes: 9899 }, allowlist)).toContain(
      'consumer bundle size changed by more than 1%',
    );
  });
});

import { describe, expect, it } from '@rstest/core';

import { type Migration, type VersionsFile, UsageError } from '../types';
import { parseExactVersion, selectMigrations } from '../versions';

const m = (id: string): Migration => ({ id, title: id, transform: () => {} });
const migrations = [m('a'), m('b'), m('pending')];
const versions: VersionsFile = { latest: '3.0.0', migrations: { a: '2.0.0', b: '3.0.0' } };
const ids = (from: string, to: string) =>
  selectMigrations({ from, to, versions, migrations }).map(x => x.id);

describe('parseExactVersion', () => {
  it('accepts exact versions and strips v', () => {
    expect(parseExactVersion('2.9.0', '--from')).toBe('2.9.0');
    expect(parseExactVersion('v2.9.0', '--from')).toBe('2.9.0');
  });
  it('rejects ranges and garbage', () => {
    for (const bad of ['^2.9.0', '2.x', 'abc']) {
      expect(() => parseExactVersion(bad, '--from')).toThrow(UsageError);
    }
  });
  it('rejects a prerelease --from, accepts a prerelease --to', () => {
    expect(() => parseExactVersion('3.0.0-rc.avatar.1', '--from')).toThrow(
      '--from 3.0.0-rc.avatar.1 is a prerelease; pass the stable version your code matches',
    );
    expect(parseExactVersion('3.0.0-rc.avatar.1', '--to')).toBe('3.0.0-rc.avatar.1');
  });
});

describe('selectMigrations', () => {
  it('selects (from, to]', () => expect(ids('1.5.0', '3.2.0')).toEqual(['a', 'b']));
  it('excludes migrations at exactly from', () => expect(ids('3.0.0', '3.2.0')).toEqual([]));
  it('includes migration at exactly to', () => expect(ids('2.9.0', '3.0.0')).toEqual(['b']));
  it('throws when from > to', () => {
    expect(() => ids('3.2.0', '3.0.0')).toThrow(UsageError);
  });
  it('throws when from < 1.0.0', () => {
    expect(() => ids('0.9.0', '3.0.0')).toThrow('upgrade to 1.x manually first');
  });
  it('throws when to is too new, not when within latest major', () => {
    expect(() => ids('3.0.0', '4.0.0')).toThrow(
      'design-system 4.0.0 is newer than this migrator knows; retry later or update @wallarm-org/migrator',
    );
    expect(() => ids('3.0.0', '3.9.9')).not.toThrow();
  });
  it('prerelease to skips too-old and includes pending', () => {
    expect(ids('3.2.0', '4.0.0-rc-feat-x.1')).toEqual(['pending']);
  });
  it('stable to ignores pending', () => expect(ids('2.9.0', '3.2.0')).toEqual(['b']));
});

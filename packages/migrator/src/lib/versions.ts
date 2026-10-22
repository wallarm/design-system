import { clean, gt, lt, lte, major, prerelease, valid } from 'semver';
import type { Migration, VersionsFile } from './types';
import { UsageError } from './types';

export function parseExactVersion(input: string, flag: '--from' | '--to'): string {
  const version = valid(clean(input));
  if (!version) {
    throw new UsageError(`${flag} must be an exact version (e.g. 2.9.0), got "${input}"`);
  }
  return version;
}

export function selectMigrations(args: {
  from: string;
  to: string;
  versions: VersionsFile;
  migrations: Migration[];
}): Migration[] {
  const { from, to, versions, migrations } = args;
  if (lt(from, '1.0.0')) {
    throw new UsageError(`--from ${from} is too old: upgrade to 1.x manually first`);
  }
  if (gt(from, to)) {
    throw new UsageError(`--from ${from} is newer than --to ${to}`);
  }
  const isPrerelease = prerelease(to) !== null;
  if (!isPrerelease && major(to) > major(versions.latest)) {
    throw new UsageError(
      `design-system ${to} is newer than this migrator knows; retry later or update @wallarm-org/migrator`,
    );
  }

  const stamped = migrations
    .flatMap(m => {
      const v = versions.migrations[m.id];
      return v === undefined ? [] : [{ m, v }];
    })
    .filter(({ v }) => gt(v, from) && lte(v, to))
    .sort((x, y) => (gt(x.v, y.v) ? 1 : gt(y.v, x.v) ? -1 : x.m.id.localeCompare(y.m.id)))
    .map(({ m }) => m);
  // Pending (unstamped) migrations ship with the next release; only prerelease targets include them.
  const pending = isPrerelease
    ? migrations
        .filter(m => !(m.id in versions.migrations))
        .sort((x, y) => x.id.localeCompare(y.id))
    : [];
  return [...stamped, ...pending];
}

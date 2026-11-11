/**
 * Local semantic-release plugin: on a major design-system release, stamps
 * every migration missing from `packages/migrator/versions.json` with the new
 * version and moves `latest` to it. Wired (main only) right before
 * `@semantic-release/git` by the root `.releaserc.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {{ latest: string, migrations: Record<string, string> }} Versions
 * @typedef {{ type: string, version: string }} NextRelease
 */

/**
 * @param {{ versions: Versions, ids: string[], nextRelease: NextRelease }} params
 * @returns {Versions}
 */
export function stampVersions({ versions, ids, nextRelease }) {
  if (nextRelease.type !== 'major') return versions;
  const migrations = { ...versions.migrations };
  for (const id of ids) migrations[id] ??= nextRelease.version;
  return { latest: nextRelease.version, migrations };
}

/**
 * @param {unknown} _pluginConfig
 * @param {{ nextRelease: NextRelease, logger: { log: (msg: string) => void, warn: (msg: string) => void }, cwd: string }} context
 */
export async function prepare(_pluginConfig, { nextRelease, logger, cwd }) {
  const pkg = path.join(cwd, 'packages/migrator');
  const file = path.join(pkg, 'versions.json');
  /** @type {Versions} */
  const versions = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ids = fs
    .readdirSync(path.join(pkg, 'src/migrations'))
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => f.slice(0, -3));

  if (nextRelease.type !== 'major') {
    const pending = ids.filter(id => !(id in versions.migrations));
    if (pending.length) {
      logger.warn(`Unstamped migrations on a ${nextRelease.type} release: ${pending.join(', ')}`);
    }
    return;
  }

  fs.writeFileSync(
    file,
    `${JSON.stringify(stampVersions({ versions, ids, nextRelease }), null, 2)}\n`,
  );
  logger.log(`Stamped packages/migrator/versions.json for ${nextRelease.version}`);
}

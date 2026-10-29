import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, matchesGlob, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export interface PackageSnapshot {
  packageJson: Record<string, unknown>;
  packFiles: string[];
  dist: Record<string, string>;
  fixtureBytes: number;
}
interface Allowlist {
  distChanged: string[];
  distAdded: string[];
}
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotDir = join(packageDir, '.claude-design/no-impact');
const matches = (path: string, patterns: string[]) =>
  patterns.some(pattern => matchesGlob(path, pattern));

export function compareSnapshots(
  base: PackageSnapshot,
  head: PackageSnapshot,
  allowlist: Allowlist,
): string[] {
  const errors: string[] = [];
  if (JSON.stringify(base.packageJson) !== JSON.stringify(head.packageJson))
    errors.push('package.json public fields changed');
  for (const path of base.packFiles)
    if (!head.packFiles.includes(path)) errors.push(`pack removed: ${path}`);
  for (const path of head.packFiles) {
    if (!base.packFiles.includes(path) && !matches(path, allowlist.distAdded))
      errors.push(`pack added: ${path}`);
  }
  for (const [path, hash] of Object.entries(base.dist)) {
    if (!(path in head.dist)) errors.push(`removed: ${path}`);
    else if (head.dist[path] !== hash && !matches(path, allowlist.distChanged))
      errors.push(`changed: ${path}`);
  }
  for (const path of Object.keys(head.dist)) {
    if (!(path in base.dist) && !matches(path, allowlist.distAdded)) errors.push(`added: ${path}`);
  }
  if (Math.abs(head.fixtureBytes - base.fixtureBytes) > base.fixtureBytes * 0.01)
    errors.push('consumer bundle size changed by more than 1%');
  return errors;
}

async function snapshot(): Promise<PackageSnapshot> {
  const pkg = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8')) as Record<
    string,
    unknown
  >;
  const fields = ['exports', 'files', 'sideEffects', 'main', 'module', 'types'];
  const pack = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: packageDir,
      encoding: 'utf8',
      maxBuffer: 8_000_000,
    }),
  ) as { files: { path: string }[] }[];
  const dist: Record<string, string> = {};
  const files = (await readdir(join(packageDir, 'dist'), { recursive: true, withFileTypes: true }))
    .filter(file => file.isFile())
    .map(file => join(file.parentPath, file.name))
    .sort();
  for (const file of files) {
    let contents: string | Buffer = await readFile(file);
    // The published metadata embeds wall-clock time. Compare every other field.
    if (file.endsWith('/metadata/components.json')) {
      const metadata = JSON.parse(contents.toString()) as Record<string, unknown>;
      delete metadata.generatedAt;
      contents = JSON.stringify(metadata);
    }
    dist[file.slice(packageDir.length + 1)] = createHash('sha256').update(contents).digest('hex');
  }
  const { build } = await import('esbuild');
  const fixture = await mkdtemp(join(tmpdir(), 'wallarm-ds-consumer-'));
  let fixtureBytes: number;
  try {
    await mkdir(join(fixture, 'node_modules/@wallarm-org'), { recursive: true });
    await symlink(packageDir, join(fixture, 'node_modules/@wallarm-org/design-system'), 'dir');
    const result = await build({
      stdin: {
        contents: "import { Button } from '@wallarm-org/design-system'; console.log(Button);",
        resolveDir: fixture,
      },
      bundle: true,
      minify: true,
      platform: 'browser',
      format: 'esm',
      write: false,
      external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
      logLevel: 'silent',
    });
    fixtureBytes = result.outputFiles.reduce((sum, file) => sum + file.contents.length, 0);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
  return {
    packageJson: Object.fromEntries(fields.map(key => [key, pkg[key]])),
    packFiles: (pack[0]?.files ?? []).map(file => file.path).sort(),
    dist,
    fixtureBytes,
  };
}

async function main() {
  const [command, first, second] = process.argv.slice(2);
  if (!first || !/^[\w-]+$/.test(first) || (second && !/^[\w-]+$/.test(second)))
    throw new Error('Use snapshot <name> or compare <base> <head>');
  await mkdir(snapshotDir, { recursive: true });
  if (command === 'snapshot') {
    const result = await snapshot();
    await writeFile(join(snapshotDir, `${first}.json`), `${JSON.stringify(result, null, 2)}\n`);
  } else if (command === 'compare' && second) {
    const read = async (name: string) =>
      JSON.parse(await readFile(join(snapshotDir, `${name}.json`), 'utf8')) as PackageSnapshot;
    const [base, head] = await Promise.all([read(first), read(second)]);
    const allowlist: Allowlist = JSON.parse(
      await readFile(join(packageDir, 'claude-design/no-impact.allowlist.json'), 'utf8'),
    );
    const errors = compareSnapshots(base, head, allowlist);
    if (errors.length) throw new Error(errors.join('\n'));
  } else throw new Error('Use snapshot <name> or compare <base> <head>');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  await main();

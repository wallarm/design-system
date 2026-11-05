#!/usr/bin/env node
// Copies the packaged Claude Design export (../dist) into a folder for Claude to publish.
// Never prompts. Exit codes: 0 done, 1 error, 2 usage, 3 done with manual steps.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SOURCE = fileURLToPath(new URL('../dist/', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const USAGE =
  'Usage: npx -y @wallarm-org/claude-design@latest export [--dir wallarm-design-system] [--overwrite] [--existing current-files.json] [--index current-index.json] [--json]';
// Files the Design System page writes itself; an update never removes them.
const PAGE_PATHS = ['project/manifest.json', 'project/api/'];
// Index keys a release owns; every other key stays as the Design System page wrote it.
// Mirrors REPLACED in src/publish-plan.ts.
const RELEASE_KEYS = [
  'title',
  'namespace',
  'libraries',
  'editing',
  'groups',
  'assetGroups',
  'lastChange',
];
const INDEX = 'project/design-system.json';

class Failure extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

const filesUnder = dir =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => relative(dir, join(file.parentPath, file.name)).split('\\').join('/'))
    .sort();

const readJson = (file, what) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Failure(`Could not read ${file} (${error.message}). Save ${what} there.`, 2);
  }
};

/** The system's current index (as saved, or wrapped in a `content` string) with this release's keys. */
const mergeIndex = (file, packed) => {
  let remote = readJson(file, `the system's ${INDEX} as JSON`);
  if (typeof remote?.content === 'string') remote = JSON.parse(remote.content);
  if (!remote || typeof remote !== 'object' || Array.isArray(remote))
    throw new Failure(`${file} must be the system's ${INDEX}, a JSON object.`, 2);
  const merged = { ...remote };
  for (const key of RELEASE_KEYS) merged[key] = packed[key];
  return merged;
};

const readPaths = file => {
  const value = readJson(file, "the system's file paths as a JSON array");
  if (!Array.isArray(value) || !value.every(path => typeof path === 'string'))
    throw new Failure(
      `${file} must be a JSON array of the system's file paths, such as ["project/tokens.css"].`,
      2,
    );
  return value;
};

function run(argv, cwd) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        dir: { type: 'string', default: 'wallarm-design-system' },
        overwrite: { type: 'boolean', default: false },
        existing: { type: 'string' },
        index: { type: 'string' },
        json: { type: 'boolean', default: false },
      },
    });
  } catch (error) {
    throw new Failure(`${error.message}\n${USAGE}`, 2);
  }
  const { values, positionals } = parsed;
  if (positionals.length !== 1 || positionals[0] !== 'export')
    throw new Failure(`Unknown command ${positionals.join(' ') || '(none)'}.\n${USAGE}`, 2);
  if (!existsSync(join(SOURCE, 'project/design-system.json')))
    throw new Failure(
      `This @wallarm-org/claude-design ${version} has no packaged export. Run the command again with @latest, or report it at https://github.com/wallarm/design-system/issues.`,
      1,
    );

  const out = resolve(cwd, values.dir);
  if (existsSync(out) && readdirSync(out).length > 0 && !values.overwrite)
    throw new Failure(
      `${out} already has files. Pass --overwrite to replace the export in it, or choose another --dir.`,
      2,
    );
  const existing = values.existing ? readPaths(resolve(cwd, values.existing)) : undefined;
  const packed = JSON.parse(readFileSync(join(SOURCE, INDEX), 'utf8'));
  const index = values.index ? mergeIndex(resolve(cwd, values.index), packed) : undefined;

  rmSync(join(out, 'project'), { recursive: true, force: true });
  cpSync(SOURCE, out, { recursive: true });
  if (index) writeFileSync(join(out, INDEX), `${JSON.stringify(index, null, 2)}\n`);
  const written = filesUnder(SOURCE);
  const hashes = Object.fromEntries(
    written.map(path => [
      path,
      createHash('sha256')
        .update(readFileSync(join(out, path)))
        .digest('hex'),
    ]),
  );
  writeFileSync(join(out, 'files.json'), `${JSON.stringify(hashes, null, 2)}\n`);

  const exported = new Set(written);
  const removed = (existing ?? [])
    .filter(path => path.startsWith('project/') && !exported.has(path))
    .filter(path => !PAGE_PATHS.some(page => path === page || path.startsWith(page)))
    .sort();
  if (existing) writeFileSync(join(out, 'removed.json'), `${JSON.stringify(removed, null, 2)}\n`);
  else rmSync(join(out, 'removed.json'), { force: true });

  const shown = relative(cwd, out) || '.';
  const projectFiles = written.filter(path => path.startsWith('project/')).length;
  const lines = [
    `Exported Wallarm Design System ${version}: ${projectFiles} files in ${join(shown, 'project')}.`,
  ];
  if (removed.length)
    lines.push(
      `Remove the ${removed.length} files the system has and this release doesn't: they're listed in ${join(shown, 'removed.json')}.`,
    );
  lines.push(
    `Read ${join(shown, 'SETUP.md')} and follow it. It publishes the system, installs it on a canvas and checks it.`,
  );
  return {
    exitCode: removed.length ? 3 : 0,
    lines,
    data: { version, dir: out, files: projectFiles, removed },
  };
}

const json = process.argv.includes('--json');
try {
  const { exitCode, lines, data } = run(process.argv.slice(2), process.cwd());
  process.stdout.write(
    json ? `${JSON.stringify({ ok: true, exitCode, data })}\n` : `${lines.join('\n')}\n`,
  );
  process.exitCode = exitCode;
} catch (error) {
  const exitCode = error instanceof Failure ? error.exitCode : 1;
  const message =
    error instanceof Failure
      ? error.message
      : `The export failed: ${error.message}. Show this output to the person.`;
  if (json) process.stdout.write(`${JSON.stringify({ ok: false, exitCode, error: message })}\n`);
  else process.stderr.write(`${message}\n`);
  process.exitCode = exitCode;
}

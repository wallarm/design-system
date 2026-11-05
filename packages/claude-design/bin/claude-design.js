#!/usr/bin/env node
// `export` copies the packaged Claude Design export (../dist) into a folder for Claude to
// publish; `index` writes the asset groups into its index once the SVGs are uploaded.
// Never prompts. Exit codes: 0 done, 1 error, 2 usage, 3 done with manual steps.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SOURCE = fileURLToPath(new URL('../dist/', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const USAGE = [
  'Usage: npx -y @wallarm-org/claude-design@latest export [--dir wallarm-design-system] [--overwrite] [--existing current-files.json] [--index current-index.json] [--json]',
  '       npx -y @wallarm-org/claude-design@latest index [--dir wallarm-design-system] [--blobs <dir>/blobs.json] [--index current-index.json] [--json]',
].join('\n');
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
// What `export` writes beside project/; --overwrite replaces it. blobs.json stays: `index` keys
// it by sha256, so an id never attaches to a changed SVG.
const OWNED = ['project', 'assets', 'assets.json', 'upload.json'];
// An uploaded asset's blob id, alone or at the end of its `/_blob/<id>` url.
const BLOB_ID = /^[0-9a-f]{32}$/;
const SHA256 = /^[0-9a-f]{64}$/;
// A blobs.json key: a sha256, or a path ending in `assets/<group>/<name>` (any prefix).
const assetPath = key => /(?:^|\/)(assets\/[^/]+\/[^/]+)$/.exec(key.split('\\').join('/'))?.[1];
const listed = items =>
  items.length > 10
    ? `${items.slice(0, 10).join(', ')} and ${items.length - 10} more`
    : items.join(', ');
const blobId = value =>
  typeof value === 'string' ? (/\/_blob\/([^/?#]+)/.exec(value)?.[1] ?? value) : undefined;

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

/** The system's current index, as saved or wrapped in a `content` string. */
const readIndex = file => {
  let remote = readJson(file, `the system's ${INDEX} as JSON`);
  if (typeof remote?.content === 'string') remote = JSON.parse(remote.content);
  if (!remote || typeof remote !== 'object' || Array.isArray(remote))
    throw new Failure(`${file} must be the system's ${INDEX}, a JSON object.`, 2);
  return remote;
};

/** The system's current index with this release's keys. */
const mergeIndex = (file, packed) => {
  const merged = { ...readIndex(file) };
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

/**
 * Adds every SVG in assets.json to the index's asset groups with its blob id: from blobs.json
 * (asset path or sha256 to id or `/_blob/<id>` url) or, for unchanged bytes, from the current
 * index. Rewrites blobs.json keyed by sha256.
 */
function writeAssetIndex(values, cwd) {
  const out = resolve(cwd, values.dir);
  const shown = relative(cwd, out) || '.';
  if (!existsSync(join(out, 'assets.json')))
    throw new Failure(
      `${join(shown, 'assets.json')} is missing. Run the export first (same --dir).`,
      2,
    );
  const assets = readJson(join(out, 'assets.json'), 'the export');
  const blobsFile = resolve(cwd, values.blobs ?? join(out, 'blobs.json'));
  const blobs = existsSync(blobsFile) ? readJson(blobsFile, 'a JSON object') : {};
  if (!blobs || typeof blobs !== 'object' || Array.isArray(blobs))
    throw new Failure(
      `${blobsFile} must be a JSON object of asset path or sha256 to blob id, such as {"assets/Icons/activity.svg": "<id>"}.`,
      2,
    );

  // Blob ids by sha256: the person's current index first, then this release's uploads.
  const ids = new Map();
  if (values.index)
    for (const group of Object.values(readIndex(resolve(cwd, values.index)).assetGroups ?? {}))
      for (const file of Object.values(group?.files ?? {}))
        if (typeof file?.sha256 === 'string' && BLOB_ID.test(file.blob ?? ''))
          ids.set(file.sha256, file.blob);
  const reused = new Set(ids.keys());
  const shaOf = new Map(assets.map(a => [a.path, a.sha256]));
  const saved = {};
  const kept = {};
  const invalid = [];
  for (const [key, value] of Object.entries(blobs)) {
    const sha = SHA256.test(key) ? key : shaOf.get(assetPath(key));
    const id = blobId(value);
    if (sha && BLOB_ID.test(id ?? '')) {
      ids.set(sha, id);
      saved[sha] = id;
    } else {
      invalid.push(key);
      kept[key] = value;
    }
  }
  if (existsSync(blobsFile))
    writeFileSync(blobsFile, `${JSON.stringify({ ...saved, ...kept }, null, 2)}\n`);
  // One path per missing sha256: identical SVGs share an upload.
  const missing = [
    ...new Map(
      assets
        .filter(a => !ids.has(a.sha256))
        .map(a => [a.sha256, join(shown, a.path)])
        .reverse(),
    ).values(),
  ].reverse();

  if (missing.length) {
    writeFileSync(join(out, 'upload.json'), `${JSON.stringify(missing, null, 2)}\n`);
    const lines = [
      `${missing.length} of ${assets.length} assets have no blob id yet; ${join(shown, INDEX)} is unchanged.`,
    ];
    if (invalid.length)
      lines.push(
        `These ${invalid.length} blobs.json entries match no asset or hold no 32-character blob id or /_blob/<id> url: ${listed(invalid)}.`,
      );
    lines.push(
      `Upload the files listed in ${join(shown, 'upload.json')} to the system as assets, add each one's path (as listed) and returned url to ${relative(cwd, blobsFile)}, then run this command again.`,
    );
    return { exitCode: 3, lines, data: { assets: assets.length, missing, invalid } };
  }

  rmSync(join(out, 'upload.json'), { force: true });
  const groups = [...new Set(assets.map(a => a.group))];
  const assetGroups = Object.fromEntries(
    groups.map(group => {
      const own = assets.filter(a => a.group === group);
      return [
        group,
        {
          name: group,
          order: own.map(a => a.name),
          files: Object.fromEntries(
            own.map(({ name, size, type, sha256 }) => [
              name,
              { name, blob: ids.get(sha256), size, type, sha256 },
            ]),
          ),
        },
      ];
    }),
  );
  const index = readJson(join(out, INDEX), 'the export');
  const packed = JSON.parse(readFileSync(join(SOURCE, INDEX), 'utf8'));
  index.createdOnFiles ??= packed.createdOnFiles;
  writeFileSync(
    join(out, INDEX),
    `${JSON.stringify({ ...index, groups, assetGroups }, null, 2)}\n`,
  );
  const reusedCount = assets.filter(a => reused.has(a.sha256) && !(a.sha256 in saved)).length;
  return {
    exitCode: 0,
    lines: [
      `Wrote ${assets.length} assets in ${groups.join(', ')} to ${join(shown, INDEX)}${reusedCount ? ` (${reusedCount} unchanged since the current index)` : ''}. Publish it last.`,
    ],
    data: { assets: assets.length, groups, reused: reusedCount, missing: [], invalid: [] },
  };
}

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
        blobs: { type: 'string' },
        json: { type: 'boolean', default: false },
      },
    });
  } catch (error) {
    throw new Failure(`${error.message}\n${USAGE}`, 2);
  }
  const { values, positionals } = parsed;
  if (positionals.length === 1 && positionals[0] === 'index') return writeAssetIndex(values, cwd);
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

  for (const path of OWNED) rmSync(join(out, path), { recursive: true, force: true });
  // Path keys `index` hasn't turned into sha256 keys may name changed SVGs: drop them.
  const blobsFile = join(out, 'blobs.json');
  if (existsSync(blobsFile)) {
    let blobs;
    try {
      blobs = JSON.parse(readFileSync(blobsFile, 'utf8'));
    } catch {}
    const bySha = Object.entries(blobs ?? {}).filter(([key]) => SHA256.test(key));
    writeFileSync(blobsFile, `${JSON.stringify(Object.fromEntries(bySha), null, 2)}\n`);
  }
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
  const assets = written.filter(path => path.startsWith('assets/')).length;
  const lines = [
    `Exported Wallarm Design System ${version}: ${projectFiles} files in ${join(shown, 'project')} and ${assets} icons and logos in ${join(shown, 'assets')}.`,
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
    data: { version, dir: out, files: projectFiles, assets, removed },
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

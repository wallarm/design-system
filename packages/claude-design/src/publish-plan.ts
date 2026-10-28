// Plans and checks a Claude Design publish from saved tool results; no network.
// Inputs: <dir>/project, <dir>/file-hashes.json and <dir>/remote/{artifact,files,assets,index}.json
// plus optional <dir>/remote/uploads/*.json (raw claude-artifacts tool results) and
// <dir>/remote/approved-stale.json (JSON array of stale paths the operator approved to remove).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CLAUDE_DESIGN } from './config';

export interface Plan {
  identityOk: boolean;
  phase: 'assets' | 'files' | 'done';
  uploads: string[][];
  batches: { files: string[]; remove: string[] }[];
  stale: string[];
  indexPath: string;
  indexSha256: string;
  counts: Record<string, number>;
}

interface RemoteFile {
  path: string;
  sha256?: string;
  of_type?: boolean;
}
type Json = Record<string, unknown>;
type AssetGroups = Record<string, { files: Record<string, { sha256: string; blob?: string }> }>;

const INDEX = 'project/design-system.json';
const UPLOAD_CHUNK = 10;
const BATCH_ENTRIES = 256;
const BATCH_BYTES = 64 * 1024 * 1024;
const REPLACED = [
  'title',
  'namespace',
  'libraries',
  'editing',
  'groups',
  'assetGroups',
  'lastChange',
];

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');
const isSvgAsset = (path: string) => path.startsWith('project/assets/') && /\.svg$/i.test(path);
const chunk = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );

/** Every object anywhere in the JSON with both `opaque_id` and `source_sha256`. */
const collectAssetIds = (value: unknown, ids: Map<string, string>) => {
  if (Array.isArray(value)) for (const item of value) collectAssetIds(item, ids);
  else if (value && typeof value === 'object') {
    const { opaque_id, source_sha256 } = value as Json;
    if (typeof opaque_id === 'string' && typeof source_sha256 === 'string')
      ids.set(source_sha256, opaque_id);
    for (const item of Object.values(value)) collectAssetIds(item, ids);
  }
};

/** read_file may be saved as the index text itself or wrapped in a `content` string. */
const readRemoteIndex = (path: string): Json => {
  const parsed = readJson(path) as Json;
  return typeof parsed.content === 'string' ? JSON.parse(parsed.content) : parsed;
};

/** `withUploads: false` trusts only the listed asset store (for check). */
const compute = (dir: string, withUploads = true) => {
  const remoteDir = join(dir, 'remote');
  const artifact = readJson(join(remoteDir, 'artifact.json')) as Json;
  const remoteFiles = (readJson(join(remoteDir, 'files.json')) as { files: RemoteFile[] }).files;
  const remoteIndex = readRemoteIndex(join(remoteDir, 'index.json'));
  const localIndex = readJson(join(dir, 'project/design-system.json')) as Json;
  const hashes = readJson(join(dir, 'file-hashes.json')) as Record<string, string>;

  for (const path of Object.keys(hashes))
    if (!existsSync(join(dir, 'project', path)))
      throw new Error(`file-hashes.json lists project/${path}, which is missing on disk`);

  const ids = new Map<string, string>();
  const assets = readJson(join(remoteDir, 'assets.json')) as Json;
  if (assets.next) throw new Error('assets.json is truncated (has a next cursor); save every page');
  collectAssetIds(assets, ids);
  const remoteAssetCount = ids.size;
  const uploadsDir = join(remoteDir, 'uploads');
  if (withUploads && existsSync(uploadsDir))
    for (const name of readdirSync(uploadsDir)
      .filter(name => name.endsWith('.json'))
      .sort())
      collectAssetIds(readJson(join(uploadsDir, name)), ids);

  const local = new Map(Object.entries(hashes).map(([path, hash]) => [`project/${path}`, hash]));
  const remote = new Map(remoteFiles.map(file => [file.path, file]));
  const svgs = [...local.keys()].filter(isSvgAsset).sort();
  // One upload per unique hash; index entries with the same bytes share its id.
  const pendingUploads = [
    ...new Map(
      svgs
        .filter(path => !ids.has(local.get(path) ?? ''))
        .reverse()
        .map(path => [local.get(path), path]),
    ).values(),
  ].sort();
  const changed = [...local.keys()]
    .filter(path => !isSvgAsset(path) && path !== INDEX)
    .filter(path => remote.get(path)?.sha256 !== local.get(path))
    .sort();
  const stale = remoteFiles
    .map(file => file.path)
    .filter(path => path.startsWith('project/') && !local.has(path) && !isSvgAsset(path))
    .filter(path => !remote.get(path)?.of_type)
    .sort();

  const assetGroups = structuredClone(localIndex.assetGroups) as AssetGroups;
  for (const group of Object.values(assetGroups))
    for (const file of Object.values(group.files)) {
      const blob = ids.get(file.sha256);
      if (blob) file.blob = blob;
    }
  // Remote key order; replaced keys the remote lacks go last; other local-only keys are dropped.
  const merged: Json = { ...remoteIndex };
  for (const key of REPLACED) merged[key] = key === 'assetGroups' ? assetGroups : localIndex[key];
  const indexText = `${JSON.stringify(merged, null, 2)}\n`;
  const indexSha256 = sha256(indexText);
  const usedIds = new Set(svgs.map(path => ids.get(local.get(path) ?? '')));
  return {
    identityOk:
      artifact.title === CLAUDE_DESIGN.title && remoteIndex.namespace === CLAUDE_DESIGN.namespace,
    pendingUploads,
    changed,
    stale,
    indexText,
    indexSha256,
    indexChanged: remote.get(INDEX)?.sha256 !== indexSha256,
    counts: {
      localFiles: local.size - svgs.length,
      remoteFiles: remoteFiles.length,
      typeOwned: remoteFiles.filter(file => file.of_type).length,
      changed: changed.length,
      stale: stale.length,
      localAssets: svgs.length,
      remoteAssets: remoteAssetCount,
      upload: pendingUploads.length,
      orphanAssets: [...new Set(ids.values())].filter(id => !usedIds.has(id)).length,
    },
  };
};

export const plan = (dir: string): Plan => {
  const result = compute(dir);
  // Deletion needs the operator's approval (repository CLAUDE.md); unapproved paths stay published.
  const approvedPath = join(dir, 'remote/approved-stale.json');
  const approvedList: unknown = existsSync(approvedPath) ? readJson(approvedPath) : [];
  if (!Array.isArray(approvedList) || approvedList.some(path => typeof path !== 'string'))
    throw new Error('remote/approved-stale.json must be a JSON array of paths');
  const approved = new Set<string>(approvedList);
  const batches: Plan['batches'] = [];
  let bytes = 0;
  const entries = [
    ...result.changed.map(path => ({ path, remove: false })),
    ...result.stale.filter(path => approved.has(path)).map(path => ({ path, remove: true })),
  ];
  for (const { path, remove } of entries) {
    const size = remove ? 0 : statSync(join(dir, path)).size;
    const last = batches.at(-1);
    if (
      !last ||
      last.files.length + last.remove.length >= BATCH_ENTRIES ||
      bytes + size > BATCH_BYTES
    ) {
      batches.push({ files: [], remove: [] });
      bytes = 0;
    }
    bytes += size;
    (batches.at(-1) as Plan['batches'][number])[remove ? 'remove' : 'files'].push(path);
  }
  const publishDir = join(dir, 'publish');
  const indexPath = join(publishDir, 'design-system.json');
  const output: Plan = {
    identityOk: result.identityOk,
    phase: result.pendingUploads.length
      ? 'assets'
      : batches.length || result.indexChanged
        ? 'files'
        : 'done',
    uploads: chunk(result.pendingUploads, UPLOAD_CHUNK),
    batches,
    stale: result.stale,
    indexPath,
    indexSha256: result.indexSha256,
    counts: { ...result.counts, batches: batches.length },
  };
  mkdirSync(publishDir, { recursive: true });
  writeFileSync(indexPath, result.indexText);
  writeFileSync(join(publishDir, 'plan.json'), `${JSON.stringify(output, null, 2)}\n`);
  return output;
};

export const check = (dir: string): string[] => {
  const result = compute(dir, false);
  return [
    ...(result.identityOk ? [] : ['remote title or namespace does not match CLAUDE_DESIGN']),
    ...result.pendingUploads.map(path => `asset not uploaded: ${path}`),
    ...result.changed.map(path => `sha256 mismatch: ${path}`),
    ...(result.indexChanged ? [`sha256 mismatch: ${INDEX}`] : []),
    ...result.stale.map(path => `stale path still published: ${path}`),
  ];
};

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const [command, dir = resolve(import.meta.dirname, '../.claude-design')] = process.argv.slice(2);
  if (command === 'plan') {
    const { uploads, batches, ...summary } = plan(dir);
    process.stdout.write(
      `${JSON.stringify({ ...summary, uploads: uploads.length, batches: batches.length }, null, 2)}\n`,
    );
  } else if (command === 'check') {
    const problems = check(dir);
    process.stdout.write(problems.length ? `${problems.join('\n')}\n` : 'Remote matches.\n');
    process.exitCode = problems.length ? 1 : 0;
  } else {
    process.stderr.write('Usage: publish-plan.ts plan|check [dir]\n');
    process.exitCode = 2;
  }
}

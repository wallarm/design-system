import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAssets } from './assets/build-assets';
import { buildBundle } from './bundle/build-bundle';
import { CLAUDE_DESIGN, DESIGN_SYSTEM_DIR } from './config';
import { buildCss } from './css/build-css';
import { buildDocs } from './docs/build-docs';
import { buildPreviews } from './previews/build-previews';
import { buildSampler } from './sampler/sampler';
import { buildTokens } from './tokens/build-tokens';

const git = (...args: string[]) =>
  execFileSync('git', args, {
    cwd: DESIGN_SYSTEM_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
export async function buildProject() {
  const root = dirname(CLAUDE_DESIGN.outDir);
  await mkdir(root, { recursive: true });
  const outDir = await mkdtemp(join(root, 'build-'));
  try {
    return await buildInto(root, outDir);
  } catch (error) {
    await rm(outDir, { recursive: true, force: true });
    throw error;
  }
}
async function buildInto(root: string, outDir: string) {
  const sha = git('rev-parse', 'HEAD');
  let ref: string;
  try {
    ref = git('describe', '--tags', '--exact-match');
  } catch {
    ref = git('rev-parse', '--abbrev-ref', 'HEAD');
  }
  const at = git('show', '-s', '--format=%cI', 'HEAD');
  const pkg = JSON.parse(await readFile(resolve(DESIGN_SYSTEM_DIR, 'package.json'), 'utf8')) as {
    version: string;
  };
  const tokens = buildTokens({
    themeDir: resolve(DESIGN_SYSTEM_DIR, 'src/theme'),
    outDir,
    ref: `${ref}@${sha}`,
    syncedAt: at,
  });
  const bundle = await buildBundle({ outDir });
  const css = await buildCss({ outDir, tokenNames: tokens.tokenNames });
  const previews = await buildPreviews({ outDir });
  const assets = await buildAssets({ outDir });
  await buildSampler({ outDir });
  const notSynced = [
    ...tokens.skipped,
    ...previews.omitted,
    'Shiki and highlight.js adapters are excluded; use the Prism adapter.',
  ];
  const docs = await buildDocs({
    outDir,
    metadataPath: resolve(DESIGN_SYSTEM_DIR, 'dist/metadata/components.json'),
    notSynced,
  });
  const groups = ['Logos', 'Icons'];
  const assetGroups: Record<
    string,
    {
      name: string;
      order: string[];
      files: Record<string, { name: string; size: number; type: string; sha256: string }>;
    }
  > = {};
  for (const group of groups) {
    const files: Record<string, { name: string; size: number; type: string; sha256: string }> = {};
    for (const name of (await readdir(join(outDir, 'assets', group)))
      .filter(name => name.endsWith('.svg'))
      .sort()) {
      const bytes = await readFile(join(outDir, 'assets', group, name));
      files[name] = {
        name,
        size: bytes.length,
        type: 'image/svg+xml',
        sha256: createHash('sha256').update(bytes).digest('hex'),
      };
    }
    assetGroups[group] = { name: group, order: Object.keys(files), files };
  }
  const index = {
    v: 3,
    layout: 'files',
    createdOnFiles: { v: 1, at },
    title: CLAUDE_DESIGN.title,
    namespace: CLAUDE_DESIGN.namespace,
    libraries: [
      { name: 'react', version: '18' },
      { name: 'react-dom', version: '18' },
    ],
    editing: 'code',
    groups,
    assetGroups,
    sections: {},
    blobs: {},
    docs: { readme: 'project/README.md', sections: [] },
    lastChange: {
      by: 'Wallarm',
      at,
      via: `GitHub · wallarm/design-system@${sha.slice(0, 8)}`,
      note: `v${pkg.version}: ${tokens.counts.color} colors, ${docs.components.length} component guides, ${assets.icons} icons.`,
    },
  };
  await writeFile(join(outDir, 'design-system.json'), `${JSON.stringify(index, null, 2)}\n`);
  const files = (await readdir(outDir, { recursive: true, withFileTypes: true }))
    .filter(file => file.isFile())
    .map(file => join(file.parentPath, file.name))
    .sort();
  // The platform asset store is separate: assets/ uploads have their own cap.
  const assetsDir = `${join(outDir, 'assets')}/`;
  const assetCount = files.filter(file => file.startsWith(assetsDir)).length;
  if (files.length - assetCount > 1008)
    throw new Error(
      `Artifact has ${files.length - assetCount} files outside assets/; maximum 1008`,
    );
  if (assetCount > 5000) throw new Error(`Artifact has ${assetCount} assets; maximum 5000`);
  const hashes: Record<string, string> = {};
  let totalBytes = 0;
  for (const file of files) {
    const bytes = await readFile(file);
    totalBytes += bytes.length;
    const relative = file.slice(outDir.length + 1);
    const cap =
      relative === 'components/bundle.js'
        ? CLAUDE_DESIGN.bundleBudgetBytes
        : relative === 'components/bundle.css'
          ? CLAUDE_DESIGN.cssCapBytes
          : relative === 'components/index.d.ts'
            ? 1_500_000
            : relative.endsWith('preview.html')
              ? 256_000
              : relative.endsWith('README.md')
                ? relative === 'README.md'
                  ? 200_000
                  : 64_000
                : relative.startsWith('fonts/')
                  ? 1_000_000
                  : 512_000;
    if (bytes.length > cap) throw new Error(`${relative}: ${bytes.length} bytes exceeds ${cap}`);
    hashes[relative] = createHash('sha256').update(bytes).digest('hex');
  }
  if (totalBytes > 256 * 1024 * 1024) throw new Error('Artifact exceeds 256 MiB');
  // Preserve the previous generated project while replacing the publish root atomically.
  const backup = join(root, `previous-${basename(outDir)}`);
  try {
    await rename(CLAUDE_DESIGN.outDir, backup);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  try {
    await rename(outDir, CLAUDE_DESIGN.outDir);
  } catch (error) {
    await rename(backup, CLAUDE_DESIGN.outDir).catch(() => undefined); // no backup when there was no previous project
    throw error;
  }
  await rm(backup, { recursive: true, force: true });
  await writeFile(join(root, 'file-hashes.json'), `${JSON.stringify(hashes, null, 2)}\n`);
  const summary = {
    version: pkg.version,
    sha,
    files: files.length,
    totalBytes,
    bundleBytes: bundle.bytes,
    cssBytes: css.bytes,
    tokens: tokens.counts,
    components: docs.components.length,
    previews: previews.withPreview.length,
    icons: assets.icons,
    notSynced: docs.notSynced,
  };
  await writeFile(join(root, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\nProject: ${CLAUDE_DESIGN.outDir}\n`);
  return summary;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  await buildProject();

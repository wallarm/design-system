import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAssets } from './assets/build-assets';
import { buildBundle } from './bundle/build-bundle';
import { CLAUDE_DESIGN, PACKAGE_DIR } from './config';
import { buildCss } from './css/build-css';
import { buildDocs } from './docs/build-docs';
import { buildPreviews } from './previews/build-previews';
import { buildTokens } from './tokens/build-tokens';

const git = (...args: string[]) =>
  execFileSync('git', args, { cwd: PACKAGE_DIR, encoding: 'utf8' }).trim();
export async function buildProject() {
  const root = dirname(CLAUDE_DESIGN.outDir);
  await mkdir(root, { recursive: true });
  const outDir = await mkdtemp(join(root, 'build-'));
  const sha = git('rev-parse', 'HEAD');
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const at = git('show', '-s', '--format=%cI', 'HEAD');
  const pkg = JSON.parse(await readFile(resolve(PACKAGE_DIR, 'package.json'), 'utf8')) as {
    version: string;
  };
  const tokens = buildTokens({
    themeDir: resolve(PACKAGE_DIR, 'src/theme'),
    outDir,
    ref: `${branch}@${sha}`,
    syncedAt: at,
  });
  const bundle = await buildBundle({ outDir });
  const css = await buildCss({ outDir, tokenNames: tokens.tokenNames });
  const previews = await buildPreviews({ outDir });
  const assets = await buildAssets({ outDir });
  const notSynced = [
    ...tokens.skipped,
    'Shiki and highlight.js adapters are excluded; use the Prism adapter.',
    'Screen templates and prop-driven Tour are deferred to phase 2.',
    ...previews.withoutStories.map(name => `${name}: no Storybook story; guidelines only.`),
  ];
  const docs = await buildDocs({
    outDir,
    metadataPath: resolve(PACKAGE_DIR, 'dist/metadata/components.json'),
    notSynced,
  });
  const groups = ['Logos', 'Icons'];
  const assetGroups: Record<
    string,
    { files: Record<string, { name: string; size: number; type: string; sha256: string }> }
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
    assetGroups[group] = { files };
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
      by: git('show', '-s', '--format=%an', 'HEAD'),
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
  if (files.length > 1008) throw new Error(`Artifact has ${files.length} files; maximum 1008`);
  const hashes: Record<string, string> = {};
  let totalBytes = 0;
  for (const file of files) {
    const bytes = await readFile(file);
    totalBytes += bytes.length;
    const relative = file.slice(outDir.length + 1);
    const cap =
      relative === 'components/bundle.js'
        ? 5_700_000
        : relative === 'components/bundle.css'
          ? 2_000_000
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
  try {
    await rename(CLAUDE_DESIGN.outDir, join(root, `previous-${basenameOf(outDir)}`));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  await rename(outDir, CLAUDE_DESIGN.outDir);
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
    notSynced,
  };
  await writeFile(join(root, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\nProject: ${CLAUDE_DESIGN.outDir}\n`);
  return summary;
}
const basenameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1);
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  await buildProject();

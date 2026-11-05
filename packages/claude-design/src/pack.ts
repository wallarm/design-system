// Packs `.claude-design/` (from `export`) into `dist/` for the npm package: the bin
// copies dist/ into a user's sandbox. Runs as `prepack`. The icon and logo SVGs are asset
// uploads, not project files: they go to `dist/assets/` (outside `project/`) with the
// `dist/assets.json` manifest, and the packed index lists no asset groups until the CLI's
// `index` command adds them with the uploaded blob ids.
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { CLAUDE_DESIGN, PACKAGE_DIR } from './config';
import { SAMPLER_FILE, SKELETON_DATA, SKELETON_FILE } from './sampler/sampler';

export const CANVAS_SAMPLER = 'wallarm-sampler.dc.html';
/** The app skeleton as a canvas board: the person's own work once installed; an update never replaces it. */
export const CANVAS_SKELETON = 'wallarm-app.dc.html';
/** The folder a canvas installs the system into, under `project/ds/`; SETUP has Claude confirm it. */
export const CANVAS_FOLDER = 'wallarm-design-system';
export const TEXT_PLAIN_FILES = ['components/index.d.ts'];
export const DESCRIPTION =
  "Wallarm's product UI: React components, light and dark tokens, Geist fonts and icons, generated from wallarm/design-system";
/** README sections SETUP step 3 sends Claude to; pack fails if one is renamed. */
export const README_SECTIONS = [
  'Rules',
  'Layout on a canvas',
  'Consuming this system',
  'From a Storybook story to an artboard',
];
const CANVAS_FILES = [
  'tokens.css',
  'tokens.json',
  'components/bundle.css',
  'components/bundle.js',
  'components/index.d.ts',
];
const SYSTEM_LINKS = [
  '<link rel="stylesheet" href="tokens.css">',
  '<link rel="stylesheet" href="components/bundle.css">',
  '<script src="components/bundle.js"></script>',
];

/** The head lines every artboard on a canvas needs: support.js, then the system under `ds/<folder>/`. */
export const CANVAS_HEAD = [
  '<script src="./support.js"></script>',
  ...SYSTEM_LINKS.map(line => line.replace(/(href|src)="/, `$1="ds/${CANVAS_FOLDER}/`)),
].join('\n');
/** Most files an Artifact asset upload takes per call (`file_paths`). */
export const ASSET_CALL_FILES = 25;
/** README lines that point at static SVGs; the npm export's SVGs are assets, not project files. */
const README_ASSET_LINES: [string, string][] = [
  [' Exported single-ink SVG assets use slate ink; see `assets/Icons/README.md`.', ''],
  [' Static versions live under `assets/Logos/`.', ''],
  [" Use the group's static SVG assets when React is unnecessary.", ''],
  ['see assets/Icons.', 'use `WallarmDS.Icons.<Name>`.'],
];

/** A system artboard (the sampler, the skeleton) for a canvas: its system links replaced by {@link CANVAS_HEAD}. */
export function canvasSampler(html: string, file = SAMPLER_FILE) {
  const at = html.indexOf(SYSTEM_LINKS.join('\n'));
  if (at === -1) throw new Error(`${file}: head must link, in order: ${SYSTEM_LINKS}`);
  return html.slice(0, at) + CANVAS_HEAD + html.slice(at + SYSTEM_LINKS.join('\n').length);
}

/** The system README without its pointers to `assets/`; throws if one of them changed. */
export function packReadme(readme: string) {
  const out = README_ASSET_LINES.reduce((text, [from, to]) => {
    if (!text.includes(from)) throw new Error(`README.md no longer has "${from}"; update pack.ts`);
    return text.replaceAll(from, to);
  }, readme);
  if (out.includes('assets/')) throw new Error('README.md still points at assets/; update pack.ts');
  return out;
}

/** The canvas.json `boards` entry for `file` at `x`, from the artboard's title and `$preview` size. */
export function boardEntry(html: string, file = CANVAS_SAMPLER, x = 0) {
  const title = /<title>([^<]+)<\/title>/.exec(html)?.[1];
  const props = /data-props="([^"]*)"/.exec(html)?.[1]?.replaceAll('&quot;', '"');
  const preview = props
    ? (JSON.parse(props) as { $preview?: { width: number; height: number } }).$preview
    : undefined;
  if (!title || !preview) throw new Error(`${file}: needs a <title> and a $preview size`);
  return {
    title,
    width: preview.width,
    entry: { [file]: { x, y: 0, w: preview.width, h: preview.height, title, expand: 'fill' } },
  };
}

/** A guide (SETUP.md, UPDATE.md) for this release; throws on a placeholder left without a value or a missing README section. */
export function renderSetup({
  name = 'SETUP.md',
  template,
  readme,
  sampler,
  skeleton,
  version,
  files,
  assets = [],
}: {
  name?: string;
  template: string;
  readme: string;
  sampler: string;
  skeleton: string;
  version: string;
  files: number;
  assets?: AssetEntry[];
}) {
  const missing = README_SECTIONS.filter(name => !readme.split('\n').includes(`## ${name}`));
  if (missing.length) throw new Error(`README.md has no section ${missing.join(', ')}`);
  const { title: boardTitle, width, entry } = boardEntry(sampler);
  // The skeleton goes right of the sampler, 80px apart, as SETUP's placement rule says.
  const app = boardEntry(skeleton, CANVAS_SKELETON, width + 80);
  const values: Record<string, string> = {
    version,
    files: String(files),
    title: CLAUDE_DESIGN.title,
    description: DESCRIPTION,
    folder: CANVAS_FOLDER,
    canvasHead: CANVAS_HEAD,
    sharedArtifact: CLAUDE_DESIGN.artifactUrl,
    samplerFile: CANVAS_SAMPLER,
    boardTitle,
    boardEntry: JSON.stringify(entry),
    skeletonFile: CANVAS_SKELETON,
    skeletonSystemFile: SKELETON_FILE,
    skeletonData: SKELETON_DATA,
    skeletonTitle: app.title,
    skeletonEntry: JSON.stringify(app.entry),
    textPlainFiles: TEXT_PLAIN_FILES.map(file => `\`project/${file}\``).join(' and '),
    canvasFiles: CANVAS_FILES.map(file => `- \`project/ds/${CANVAS_FOLDER}/${file}\``).join('\n'),
    readmeSections: README_SECTIONS.map(name => `"${name}"`).join(', '),
    assets: String(assets.length),
    assetCallFiles: String(ASSET_CALL_FILES),
    assetUploads: String(new Set(assets.map(a => a.sha256)).size),
    assetCalls: String(Math.ceil(new Set(assets.map(a => a.sha256)).size / ASSET_CALL_FILES)),
    assetGroups: [...new Set(assets.map(a => a.group))]
      .map(group => `${group} (${assets.filter(a => a.group === group).length})`)
      .join(', '),
  };
  const guide = template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => values[name] ?? match);
  const left = [...new Set(guide.match(/\{\{\w+\}\}/g))];
  if (left.length) throw new Error(`${name}: no value for ${left.join(', ')}`);
  return guide;
}

export interface AssetEntry {
  group: string;
  name: string;
  /** Relative to the export folder, outside `project/`. */
  path: string;
  sha256: string;
  size: number;
  type: string;
}
type AssetGroups = Record<
  string,
  { order: string[]; files: Record<string, Omit<AssetEntry, 'group' | 'path'>> }
>;

/** The index's asset records in gallery order, each SVG copied to `<outDir>/assets/<group>/`. */
export function packAssets(
  project: string,
  index: { groups: string[]; assetGroups: AssetGroups },
  outDir: string,
) {
  return index.groups.flatMap(group => {
    const { order, files } = index.assetGroups[group] ?? { order: [], files: {} };
    return order.map(name => {
      const record = files[name];
      if (!record) throw new Error(`design-system.json: ${group} orders ${name} but has no record`);
      const { size, type, sha256 } = record;
      const path = `assets/${group}/${name}`;
      const bytes = readFileSync(join(project, path));
      if (createHash('sha256').update(bytes).digest('hex') !== sha256)
        throw new Error(`project/${path} does not match its sha256 in design-system.json`);
      mkdirSync(join(outDir, 'assets', group), { recursive: true });
      writeFileSync(join(outDir, path), bytes);
      return { group, name, path, sha256, size, type } satisfies AssetEntry;
    });
  });
}

/** Writes `<outDir>/{project,assets,assets.json,SETUP.md,UPDATE.md,wallarm-sampler.dc.html,wallarm-app.dc.html}` from a built `.claude-design/`. */
export function pack(
  source = resolve(PACKAGE_DIR, '.claude-design'),
  outDir = resolve(PACKAGE_DIR, 'dist'),
) {
  const project = join(source, 'project');
  if (!existsSync(join(source, 'summary.json')))
    throw new Error(
      `${source} has no export. Run \`pnpm turbo run export --filter=@wallarm-org/claude-design\` from the repo root first.`,
    );
  const { version } = JSON.parse(readFileSync(join(source, 'summary.json'), 'utf8')) as {
    version: string;
  };
  const own = (
    JSON.parse(readFileSync(join(PACKAGE_DIR, 'package.json'), 'utf8')) as { version: string }
  ).version;
  if (own !== '0.0.0' && own !== version)
    throw new Error(
      `package.json is ${own} but the export was built from design-system ${version}`,
    );

  rmSync(outDir, { recursive: true, force: true });
  cpSync(project, join(outDir, 'project'), {
    recursive: true,
    filter: path => !/^[/\\]assets([/\\]|$)/.test(path.slice(project.length)),
  });
  const readmePath = join(outDir, 'project/README.md');
  writeFileSync(readmePath, packReadme(readFileSync(readmePath, 'utf8')));
  const indexPath = join(outDir, 'project/design-system.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf8')) as Record<string, unknown> & {
    groups: string[];
    assetGroups: AssetGroups;
  };
  const assets = packAssets(project, index, outDir);
  writeFileSync(join(outDir, 'assets.json'), `${JSON.stringify(assets, null, 2)}\n`);
  writeFileSync(
    indexPath,
    `${JSON.stringify({ ...index, groups: [], assetGroups: {} }, null, 2)}\n`,
  );

  const files = readdirSync(join(outDir, 'project'), {
    recursive: true,
    withFileTypes: true,
  }).filter(file => file.isFile()).length;
  const sampler = canvasSampler(readFileSync(join(project, SAMPLER_FILE), 'utf8'));
  writeFileSync(join(outDir, CANVAS_SAMPLER), sampler);
  const skeleton = canvasSampler(readFileSync(join(project, SKELETON_FILE), 'utf8'), SKELETON_FILE);
  writeFileSync(join(outDir, CANVAS_SKELETON), skeleton);
  for (const name of ['SETUP.md', 'UPDATE.md'])
    writeFileSync(
      join(outDir, name),
      renderSetup({
        name,
        template: readFileSync(join(PACKAGE_DIR, 'content', name), 'utf8'),
        readme: readFileSync(readmePath, 'utf8'),
        sampler,
        skeleton,
        version,
        files,
        assets,
      }),
    );
  return { version, files, assets: assets.length };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const { version, files, assets } = pack();
  process.stdout.write(
    `Packed Wallarm Design System ${version}: ${files} files in dist/project, ${assets} in dist/assets\n`,
  );
}

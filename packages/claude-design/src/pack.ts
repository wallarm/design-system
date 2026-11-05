// Packs `.claude-design/` (from `export`) into `dist/` for the npm package: the bin
// copies dist/ into a user's sandbox. Runs as `prepack`. A prompt-installed system has
// no asset uploads: icons ship in bundle.js, so the static SVGs and asset groups are left out.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { CLAUDE_DESIGN, PACKAGE_DIR } from './config';
import { SAMPLER_FILE } from './sampler/sampler';

export const CANVAS_SAMPLER = 'wallarm-sampler.dc.html';
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

/** The sampler as a canvas artboard: the canvas's support.js, then the system links under `ds/<folder>/`. */
export function canvasSampler(html: string) {
  const at = html.indexOf(SYSTEM_LINKS.join('\n'));
  if (at === -1) throw new Error(`${SAMPLER_FILE}: head must link, in order: ${SYSTEM_LINKS}`);
  const links = SYSTEM_LINKS.map(line => line.replace(/(href|src)="/, `$1="ds/${CANVAS_FOLDER}/`));
  return (
    html.slice(0, at) +
    ['<script src="./support.js"></script>', ...links].join('\n') +
    html.slice(at + SYSTEM_LINKS.join('\n').length)
  );
}

/** The canvas.json `boards` entry, from the sampler's title and `$preview` size. */
export function boardEntry(html: string) {
  const title = /<title>([^<]+)<\/title>/.exec(html)?.[1];
  const props = /data-props="([^"]*)"/.exec(html)?.[1]?.replaceAll('&quot;', '"');
  const preview = props
    ? (JSON.parse(props) as { $preview?: { width: number; height: number } }).$preview
    : undefined;
  if (!title || !preview) throw new Error(`${SAMPLER_FILE}: needs a <title> and a $preview size`);
  return {
    title,
    entry: {
      [CANVAS_SAMPLER]: { x: 0, y: 0, w: preview.width, h: preview.height, title, expand: 'fill' },
    },
  };
}

/** SETUP.md for this release; throws on a placeholder left without a value or a missing README section. */
export function renderSetup({
  template,
  readme,
  sampler,
  version,
  files,
}: {
  template: string;
  readme: string;
  sampler: string;
  version: string;
  files: number;
}) {
  const missing = README_SECTIONS.filter(name => !readme.split('\n').includes(`## ${name}`));
  if (missing.length) throw new Error(`README.md has no section ${missing.join(', ')}`);
  const { title: boardTitle, entry } = boardEntry(sampler);
  const values: Record<string, string> = {
    version,
    files: String(files),
    title: CLAUDE_DESIGN.title,
    description: DESCRIPTION,
    folder: CANVAS_FOLDER,
    samplerFile: CANVAS_SAMPLER,
    boardTitle,
    boardEntry: JSON.stringify(entry),
    textPlainFiles: TEXT_PLAIN_FILES.map(file => `\`project/${file}\``).join(' and '),
    canvasFiles: CANVAS_FILES.map(file => `- \`project/ds/${CANVAS_FOLDER}/${file}\``).join('\n'),
    readmeSections: README_SECTIONS.map(name => `"${name}"`).join(', '),
  };
  const guide = template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => values[name] ?? match);
  const left = [...new Set(guide.match(/\{\{\w+\}\}/g))];
  if (left.length) throw new Error(`SETUP.md: no value for ${left.join(', ')}`);
  return guide;
}

/** Writes `<outDir>/{project,SETUP.md,wallarm-sampler.dc.html}` from a built `.claude-design/`. */
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
    filter: path => !/^[/\\]assets[/\\].*\.svg$/i.test(path.slice(project.length)),
  });
  const indexPath = join(outDir, 'project/design-system.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf8')) as Record<string, unknown>;
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
  const setup = renderSetup({
    template: readFileSync(join(PACKAGE_DIR, 'content/SETUP.md'), 'utf8'),
    readme: readFileSync(join(project, 'README.md'), 'utf8'),
    sampler,
    version,
    files,
  });
  writeFileSync(join(outDir, 'SETUP.md'), setup);
  return { version, files };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const { version, files } = pack();
  process.stdout.write(`Packed Wallarm Design System ${version}: ${files} files in dist/project\n`);
}

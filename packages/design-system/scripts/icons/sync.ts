/**
 * Sync icon components from the WADS-Iconography Figma file.
 *
 *   pnpm icons:sync                          # regenerate every mapped icon + add new ones
 *   pnpm icons:sync --dry-run                # only report what Figma has that the repo doesn't
 *   pnpm icons:sync --only Bell,BellOff      # limit to these components
 *   pnpm icons:sync --category 'Edit & Text' # gallery category for icons added in this run
 *   pnpm icons:sync --code-connect          # only rewrite the Code Connect batch (no SVG fetch)
 *
 * Needs FIGMA_ACCESS_TOKEN (personal access token with read access to the file) in the
 * environment or in the repo-root `.env.local`. `manifest.json` is the registry:
 * Figma node id → component name, plus excluded nodes and hand-kept icons.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { type IconTone, svgToIconBody } from './svg.js';

interface Manifest {
  fileKey: string;
  pageId: string;
  brandGroups: string[];
  exclude: { groups: string[]; namePrefixes: string[]; nodes: Record<string, string> };
  keep: Record<string, string>;
  icons: Record<string, string>;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface Component {
  id: string;
  layer: string;
  group: string;
  /** Parent COMPONENT_SET id — Code Connect can only target the set, not its variants. */
  set?: string;
}

interface Target {
  name: string;
  nodeId: string;
  tone: IconTone;
  isNew: boolean;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(pkgRoot, '../..');
const iconsDir = path.join(pkgRoot, 'src/icons');
const manifestPath = path.join(here, 'manifest.json');
const indexPath = path.join(iconsDir, 'index.ts');
const categoriesPath = path.join(iconsDir, 'module/const.ts');
const codeConnectPath = path.join(iconsDir, 'module/Icons.figma.batch.json');
const codeConnectTemplatePath = path.join(iconsDir, 'module/Icons.figma.batch.ts');

const { values: opts } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'code-connect': { type: 'boolean', default: false },
    only: { type: 'string' },
    category: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (opts.help) {
  console.log(
    readFileSync(fileURLToPath(import.meta.url), 'utf8').match(/\/\*\*([\s\S]*?)\*\//)?.[1],
  );
  process.exit(0);
}

try {
  process.loadEnvFile(path.join(repoRoot, '.env.local'));
} catch {
  // optional — FIGMA_ACCESS_TOKEN may come from the shell
}
const token = process.env.FIGMA_ACCESS_TOKEN;
if (!token) {
  console.error(
    'FIGMA_ACCESS_TOKEN is not set. Create one at Figma → Settings → Security → Personal access tokens',
  );
  console.error(
    '(scope "File content: read") and put FIGMA_ACCESS_TOKEN=… into the repo-root .env.local.',
  );
  process.exit(1);
}

const manifest: Manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const figma = async <T>(endpoint: string): Promise<T> => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.figma.com/v1${endpoint}`, {
      headers: { 'X-Figma-Token': token },
    });
    if (res.ok) return (await res.json()) as T;
    if (res.status === 429 && attempt < 4) {
      const wait = Number(res.headers.get('retry-after') ?? 10);
      console.warn(`Figma rate limit, retrying in ${wait}s…`);
      await new Promise(r => setTimeout(r, wait * 1000));
      continue;
    }
    throw new Error(`Figma ${endpoint.split('?')[0]} → ${res.status} ${await res.text()}`);
  }
};

const pascal = (s: string) =>
  s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase() + w.slice(1))
    .join('');

/** `Name=WhatsApp, Colors=Neutral` → WhatsappNeutral, `Provider=smtp` → Smtp, `Icon / circle-x` → CircleX. */
const deriveName = ({ layer }: Component) => {
  const props = Object.fromEntries(
    layer
      .split(',')
      .flatMap(p => (p.includes('=') ? [p.trim().split('=') as [string, string]] : [])),
  );
  const base = props.Name ?? props.Provider ?? props.Type ?? layer.split('/').at(-1) ?? layer;
  const name = pascal(base);
  return props.Colors === 'Neutral' ? `${name}Neutral` : name;
};

const listComponents = async (): Promise<Component[]> => {
  const res = await figma<{ nodes: Record<string, { document: FigmaNode }> }>(
    `/files/${manifest.fileKey}/nodes?ids=${manifest.pageId}&depth=3`,
  );
  const page = res.nodes[manifest.pageId]?.document;
  if (!page) throw new Error(`Page ${manifest.pageId} not found in ${manifest.fileKey}`);

  const out: Component[] = [];
  const visit = (node: FigmaNode, group: string, set?: string) => {
    if (node.type === 'COMPONENT') out.push({ id: node.id, layer: node.name, group, set });
    else
      for (const child of node.children ?? [])
        visit(
          child,
          node.type === 'CANVAS' ? '' : node.name,
          node.type === 'COMPONENT_SET' ? node.id : undefined,
        );
  };
  visit(page, '');
  return out;
};

const isExcluded = (c: Component) =>
  manifest.exclude.groups.includes(c.group) ||
  manifest.exclude.namePrefixes.some(p => c.layer.startsWith(p)) ||
  c.id in manifest.exclude.nodes;

const planTargets = (components: Component[]) => {
  const taken = new Map(Object.entries(manifest.icons).map(([id, name]) => [name, id]));
  const targets: Target[] = [];
  const errors: string[] = [];

  for (const c of components.filter(c => !isExcluded(c))) {
    let name = manifest.icons[c.id];
    if (!name) {
      name = deriveName(c);
      if (taken.has(name) || existsSync(path.join(iconsDir, `${name}.tsx`))) {
        errors.push(
          `"${c.layer}" (${c.id}) → ${name} collides with an existing icon. ` +
            'Map the node to a unique name in manifest.icons, or add it to exclude.nodes.',
        );
        continue;
      }
      taken.set(name, c.id);
    }
    const isNew = !existsSync(path.join(iconsDir, `${name}.tsx`));
    const brand = manifest.brandGroups.includes(c.group);
    const tone: IconTone = !brand
      ? 'mono'
      : /Colors=Neutral/.test(c.layer)
        ? 'neutral'
        : 'original';
    targets.push({ name, nodeId: c.id, tone, isNew });
  }

  // Brand marks without a Figma Neutral variant get a currentColor twin (convention from #251).
  for (const t of targets.filter(t => t.tone === 'original')) {
    const neutralName = `${t.name}Neutral`;
    if (!targets.some(o => o.name === neutralName)) {
      const isNew = !existsSync(path.join(iconsDir, `${neutralName}.tsx`));
      targets.push({ name: neutralName, nodeId: t.nodeId, tone: 'neutral', isNew });
    }
  }

  const live = new Set(components.map(c => c.id));
  const stale = Object.entries(manifest.icons).filter(([id]) => !live.has(id));
  return { targets, errors, stale };
};

const fetchSvgs = async (nodeIds: string[]) => {
  const urls: Record<string, string | null> = {};
  for (let i = 0; i < nodeIds.length; i += 100) {
    const ids = nodeIds.slice(i, i + 100).join(',');
    const res = await figma<{ images: Record<string, string | null> }>(
      `/images/${manifest.fileKey}?ids=${ids}&format=svg&svg_include_id=false&svg_simplify_stroke=true`,
    );
    Object.assign(urls, res.images);
  }
  const svgs = new Map<string, string>();
  const entries = Object.entries(urls);
  for (let i = 0; i < entries.length; i += 16) {
    await Promise.all(
      entries.slice(i, i + 16).map(async ([id, url]) => {
        if (!url) throw new Error(`Figma could not render node ${id}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download of ${id} failed: ${res.status}`);
        svgs.set(id, await res.text());
      }),
    );
  }
  return svgs;
};

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Oxlint's no-shadow-restricted-names forbids shadowing these global values.
const RESTRICTED_NAMES = new Set([
  'Infinity',
  'NaN',
  'Map',
  'Set',
  'Symbol',
  'Proxy',
  'Function',
  'Date',
]);

/** Icon names like `Infinity` intentionally shadow JS globals. */
const shadowIgnore = (name: string, indent = '') =>
  RESTRICTED_NAMES.has(name)
    ? `${indent}// oxlint-disable-next-line no-shadow-restricted-names -- icon name matches Lucide convention\n`
    : '';

const iconFile = (name: string, viewBox: string, jsx: string) => `import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

${shadowIgnore(name)}export const ${name}: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='${viewBox}'>
    ${jsx}
  </SvgIcon>
);

${name}.displayName = '${name}Icon';
`;

const addExports = (names: string[]) => {
  const source = readFileSync(indexPath, 'utf8');
  const missing = names.filter(n => !source.includes(`from './${n}';`));
  if (missing.length) {
    writeFileSync(
      indexPath,
      source + missing.map(n => `export { ${n} } from './${n}';\n`).join(''),
    );
  }
};

const addToCategory = (category: string, names: string[]) => {
  const source = readFileSync(categoriesPath, 'utf8');
  const header = `  '${category}': [\n`;
  const start = source.indexOf(header);
  if (start < 0) {
    const known = [...source.matchAll(/^ {2}'(.+)': \[$/gm)].map(m => m[1]);
    throw new Error(`Unknown category "${category}". Known: ${known.join(', ')}`);
  }
  const bodyStart = start + header.length;
  const bodyEnd = source.indexOf('  ],', bodyStart);
  const current = [...source.slice(bodyStart, bodyEnd).matchAll(/'(\w+)'/g)].map(
    m => m[1] as string,
  );
  const merged = [...new Set([...current, ...names])]; // categories are curated, so append
  const body = merged.map(n => `    '${n}',\n`).join('');
  writeFileSync(categoriesPath, source.slice(0, bodyStart) + body + source.slice(bodyEnd));
};

/**
 * Every Figma-sourced icon is Code-Connected; regenerated whole so it can't drift. Variants of a
 * component set (brand marks) can't be connected one by one, so each set gets a single entry whose
 * `variants` map (variant layer name → icon) the template resolves against the selected instance.
 */
const writeCodeConnect = (figmaComponents: Component[]) => {
  const byId = new Map(figmaComponents.map(c => [c.id, c]));
  const url = (id: string) =>
    `https://www.figma.com/design/${manifest.fileKey}/ICONS?node-id=${id.replace(':', '-')}`;
  const plain: Record<string, string>[] = [];
  const sets = new Map<string, { group: string; variants: Record<string, string> }>();
  for (const [id, name] of Object.entries(manifest.icons)
    .filter(([, name]) => existsSync(path.join(iconsDir, `${name}.tsx`)))
    .sort(([, a], [, b]) => a.localeCompare(b))) {
    const c = byId.get(id);
    if (!c?.set) {
      plain.push({ url: url(id), component: name, id: name, componentName: name });
      continue;
    }
    const entry = sets.get(c.set) ?? { group: c.group, variants: {} };
    entry.variants[c.layer] = name;
    sets.set(c.set, entry);
  }
  const components = [
    ...plain,
    ...[...sets].map(([setId, { group, variants }]) => ({
      url: url(setId),
      component: group,
      id: `icons-${group}`,
      variants,
    })),
  ];
  writeFileSync(
    codeConnectPath,
    `${JSON.stringify({ templateFile: `./${path.basename(codeConnectTemplatePath)}`, components }, null, 2)}\n`,
  );
  writeFileSync(
    codeConnectTemplatePath,
    `// Generated by \`pnpm icons:sync\` — do not edit by hand. Rendered once per entry of Icons.figma.batch.json.
import figma from 'figma';

const instance = figma.selectedInstance;
const variants: Record<string, string> | undefined = figma.batch.variants;
const name: string | undefined = variants
  ? Object.entries(variants).find(([layer]) =>
      layer.split(', ').every(pair => {
        const [prop, value] = pair.split('=');
        return instance.getPropertyValue(prop) === value;
      }),
    )?.[1]
  : figma.batch.componentName;

export default {
  id: figma.batch.id,
  imports: name ? [\`import { \${name} } from '@wallarm-org/design-system/icons';\`] : [],
  example: name ? figma.code\`<\${name} />\` : figma.code\`{/* No icon component for this variant */}\`,
  metadata: { nestable: true },
};
`,
  );
};

const main = async () => {
  const components = await listComponents();
  const { targets, errors, stale } = planTargets(components);
  const newTargets = targets.filter(t => t.isNew);

  for (const [id, name] of stale)
    console.warn(`! ${name}: node ${id} is gone from Figma (file left untouched)`);
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    process.exit(1);
  }
  console.log(
    `Figma: ${components.length} components, ${targets.length} icons to sync${
      newTargets.length ? `, new: ${newTargets.map(t => t.name).join(', ')}` : ', nothing new'
    }`,
  );
  if (opts['dry-run']) return;
  if (opts['code-connect']) {
    writeCodeConnect(components);
    execFileSync('pnpm', ['exec', 'oxlint', '--fix', codeConnectTemplatePath], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    execFileSync('pnpm', ['exec', 'oxfmt', '--write', codeConnectPath, codeConnectTemplatePath], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    return;
  }

  const only = opts.only?.split(',').map(s => s.trim());
  const selected = targets.filter(
    t => !(t.name in manifest.keep) && (!only || only.includes(t.name) || (t.isNew && !opts.only)),
  );
  const unknown = only?.filter(n => !targets.some(t => t.name === n)) ?? [];
  if (unknown.length) throw new Error(`Not found in Figma/manifest: ${unknown.join(', ')}`);

  const svgs = await fetchSvgs([...new Set(selected.map(t => t.nodeId))]);
  const before = new Map<string, string | null>();
  const written: string[] = [];

  for (const t of selected) {
    const svg = svgs.get(t.nodeId);
    if (!svg) throw new Error(`No SVG for ${t.name} (${t.nodeId})`);
    const { viewBox, jsx, warnings } = svgToIconBody(svg, t.tone, kebab(t.name));
    for (const w of warnings) console.warn(`! ${t.name}: ${w}`);
    const file = path.join(iconsDir, `${t.name}.tsx`);
    before.set(file, existsSync(file) ? readFileSync(file, 'utf8') : null);
    writeFileSync(file, iconFile(t.name, viewBox, jsx));
    written.push(file);
  }

  // Derived *Neutral twins share their original's node, which is registered first.
  for (const t of newTargets) manifest.icons[t.nodeId] ??= t.name;
  manifest.icons = Object.fromEntries(
    Object.entries(manifest.icons).sort(([, a], [, b]) => a.localeCompare(b)),
  );
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const added = newTargets.map(t => t.name);
  addExports(added);
  if (added.length && opts.category) addToCategory(opts.category, added);
  writeCodeConnect(components);

  const touched = [
    ...written,
    indexPath,
    categoriesPath,
    codeConnectPath,
    codeConnectTemplatePath,
    manifestPath,
  ];
  execFileSync('pnpm', ['exec', 'oxlint', '--fix', ...touched], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  execFileSync('pnpm', ['exec', 'oxfmt', '--write', ...touched], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  const changed = written.filter(f => before.get(f) !== readFileSync(f, 'utf8'));
  console.log(
    `✓ ${written.length} generated: ${added.length} new, ${changed.length - added.length} updated, ${written.length - changed.length} unchanged${
      Object.keys(manifest.keep).length
        ? `; kept by hand: ${Object.keys(manifest.keep).join(', ')}`
        : ''
    }`,
  );
  if (added.length && !opts.category) {
    console.log(
      `  New icons land in the gallery's "General" group — rerun with --category to file them.`,
    );
  }
};

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

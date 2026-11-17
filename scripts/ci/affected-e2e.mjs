import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = 'packages/design-system/src/';
// Inside src, only the theme reaches every story without an import edge (CSS tokens, utilities).
const THEME = `${SRC}theme/`;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

function resolveImport(from, spec) {
  const base = resolve(dirname(from), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
}

// `@wallarm-org/design-system[/sub]` → its `development` export in package.json
function resolveSelf(root, sub = '') {
  const path = !sub ? 'index' : /^(icons|utils)(\/|$)/.test(sub) ? sub : `components/${sub}`;
  return resolveImport(join(root, SRC, 'index.ts'), `./${path}`);
}

/**
 * E2E specs that a change can affect. A spec drives the stories next to it, and stories render
 * source over relative imports or the package's own name (design-system has no path aliases), so
 * a spec is affected when a file in its component folder transitively imports a changed file.
 *
 * @param {string} root repo root
 * @param {string[]} changed repo-relative paths, already narrowed to the E2E-relevant set
 * @returns {'ALL' | string[]} specs relative to packages/design-system
 */
export function affectedE2e(root, changed) {
  // Config, Storybook, dependencies and the theme change every story without an import edge.
  if (changed.some((file) => !file.startsWith(SRC) || file.startsWith(THEME))) return 'ALL';

  const files = walk(join(root, SRC));
  const importers = new Map();
  for (const file of files) {
    // Code Connect files only quote imports as strings; Storybook never renders them
    if (!/\.tsx?$/.test(file) || file.endsWith('.figma.ts')) continue;
    for (const [, spec, self] of readFileSync(file, 'utf8').matchAll(
      /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+|@wallarm-org\/design-system(?:\/([^'"]+))?)['"]/g,
    )) {
      const target = spec.startsWith('.') ? resolveImport(file, spec) : resolveSelf(root, self);
      if (!target) continue;
      if (!importers.has(target)) importers.set(target, new Set());
      importers.get(target).add(file);
    }
  }

  const reached = new Set();
  // A changed baseline belongs to its spec: Foo.e2e.ts-snapshots/x.png → Foo.e2e.ts
  const queue = changed.map((file) => join(root, file.replace(/(\.e2e\.ts)-snapshots\/.*$/, '$1')));
  while (queue.length) {
    const file = queue.pop();
    if (reached.has(file)) continue;
    reached.add(file);
    queue.push(...(importers.get(file) ?? []));
  }

  // A spec's folder (minus __tests__) owns its subtree: FilterInput/__tests__ drives FilterInput/stories
  const owns = (spec, file) => file.startsWith(`${dirname(spec).replace(/\/__tests__$/, '')}/`);
  const packageDir = join(root, 'packages/design-system');
  return files
    .filter((file) => file.endsWith('.e2e.ts'))
    .filter((spec) => [...reached].some((file) => owns(spec, file)))
    .map((spec) => relative(packageDir, spec))
    .sort();
}

// CLI: changed paths on stdin (one per line), prints `ALL` or space-separated specs
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const changed = readFileSync(0, 'utf8').split('\n').filter(Boolean);
  const specs = affectedE2e(root, changed);
  console.log(specs === 'ALL' ? 'ALL' : specs.join(' '));
}

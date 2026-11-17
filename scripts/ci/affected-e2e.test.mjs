import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { affectedE2e } from './affected-e2e.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ds = 'packages/design-system/';

test('config, dependency and theme changes run every spec', () => {
  assert.equal(affectedE2e(root, ['pnpm-lock.yaml']), 'ALL');
  assert.equal(affectedE2e(root, [`${ds}.storybook/preview.tsx`]), 'ALL');
  assert.equal(affectedE2e(root, [`${ds}src/theme/semantic.css`]), 'ALL');
});

test('a component change runs its own spec and the specs of components importing it', () => {
  const specs = affectedE2e(root, [`${ds}src/components/Button/Button.tsx`]);
  assert.ok(specs.includes('src/components/Button/Button.e2e.ts'));
  assert.ok(specs.some((spec) => !spec.startsWith('src/components/Button/')));
});

test('a leaf change does not run unrelated specs', () => {
  const specs = affectedE2e(root, [`${ds}src/components/Table/Table.stories.tsx`]);
  assert.deepEqual(specs, ['src/components/Table/Table.e2e.ts']);
});

test('a changed baseline runs its spec', () => {
  const specs = affectedE2e(root, [
    `${ds}src/components/Table/Table.e2e.ts-snapshots/basic-chromium-linux.png`,
  ]);
  assert.deepEqual(specs, ['src/components/Table/Table.e2e.ts']);
});

test('specs under __tests__ belong to their component folder', () => {
  const story = readdirSync(join(root, ds, 'src/components/FilterInput/stories')).find((file) =>
    file.endsWith('.stories.tsx'),
  );
  const specs = affectedE2e(root, [`${ds}src/components/FilterInput/stories/${story}`]);
  assert.ok(specs.length > 0);
  assert.ok(specs.every((spec) => spec.startsWith('src/components/FilterInput/__tests__/')));
});

test('no changes run nothing', () => {
  assert.deepEqual(affectedE2e(root, []), []);
});

test("an import by the package's own name counts as an edge, a Code Connect string does not", (t) => {
  const tmp = mkdtempSync(join(tmpdir(), 'affected-e2e-'));
  t.after(() => rmSync(tmp, { recursive: true, force: true }));
  const files = {
    'A/index.ts': "export * from './A';",
    'A/A.tsx': 'export const A = 1;',
    'A/A.e2e.ts': '',
    'B/B.stories.tsx': "import { A } from '@wallarm-org/design-system/A';",
    'B/B.e2e.ts': '',
    'C/C.figma.ts': `const example = "import { A } from '@wallarm-org/design-system/A';";`,
    'C/C.e2e.ts': '',
  };
  for (const [path, content] of Object.entries(files)) {
    const file = join(tmp, ds, 'src/components', path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  assert.deepEqual(affectedE2e(tmp, [`${ds}src/components/A/A.tsx`]), [
    'src/components/A/A.e2e.ts',
    'src/components/B/B.e2e.ts',
  ]);
});

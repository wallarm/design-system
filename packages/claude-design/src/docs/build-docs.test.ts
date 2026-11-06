import { beforeAll, describe, expect, it } from '@rstest/core';
import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { CLAUDE_DESIGN, DESIGN_SYSTEM_DIR } from '../config';
import { boardEntry, CANVAS_FOLDER, CANVAS_HEAD, CANVAS_SKELETON } from '../pack';
import { SKELETON_DATA, SKELETON_FILE } from '../sampler/sampler';
import { assertStoriesShipped, buildDocs } from './build-docs';
import { CONTROLLED_OPEN, DEFAULT_OPEN } from './consuming';
import { storyGuide } from './story-guide';

const skeleton = readFileSync(new URL(`../sampler/${SKELETON_FILE}`, import.meta.url), 'utf8');
const guideName = (storyFile: string): string => path.basename(storyFile, '.stories.tsx');

describe('Claude Design documentation', () => {
  let outDir: string;
  let components: string[];
  let metadata: DesignSystemMetadata;
  const guideText = async (name: string): Promise<string> => {
    const dir = path.join(outDir, 'components', name);
    const readme = await readFile(path.join(dir, 'README.md'), 'utf8');
    const stories = await readFile(path.join(dir, 'stories.md'), 'utf8').catch(() => '');
    return `${readme}\n${stories}`;
  };

  beforeAll(async () => {
    outDir = await mkdtemp(path.join(tmpdir(), 'wallarm-canvas-docs-'));
    metadata = JSON.parse(
      await readFile(path.join(DESIGN_SYSTEM_DIR, 'dist/metadata/components.json'), 'utf8'),
    );
    const button = metadata.components.find(component => component.name === 'Button');
    const variant = button?.props.find(prop => prop.name === 'variant');
    if (variant) variant.defaultValue = 'stale-metadata-default';
    const metadataPath = path.join(outDir, 'metadata.json');
    await writeFile(metadataPath, JSON.stringify(metadata));
    ({ components } = await buildDocs({
      outDir,
      metadataPath,
      notSynced: ['Example intentionally skipped token'],
    }));
  });

  it('explains the canvas runtime, artboard root and actual omissions', async () => {
    const readme = await readFile(path.join(outDir, 'README.md'), 'utf8');
    expect(readme.split('\n')[0]).toBe(
      'Generated from wallarm/design-system — change it in code and run /claude-design-sync there.',
    );
    for (const required of [
      '## Consuming this system',
      'WallarmDS.Root',
      'WallarmDS.Icons.',
      'From a Storybook story to an artboard',
      'React.createElement(WallarmDS.X',
      'this.setState',
      'formatChartDate',
      'WallarmDS.toaster',
      'x-import',
      'theme="dark"',
      'Example intentionally skipped token',
    ]) {
      expect(readme).toContain(required);
    }
    expect(readme).not.toContain('components/lib/react');
    expect(readme).not.toContain('TableCells');
  });

  it('embeds rules.md verbatim and points to the sampler and pattern guides', async () => {
    const readme = await readFile(path.join(outDir, 'README.md'), 'utf8');
    const rules = await readFile(path.join(DESIGN_SYSTEM_DIR, 'src/guidelines/rules.md'), 'utf8');
    expect(readme).toContain(rules.trim());
    expect(readme).not.toContain('<!-- rules.md -->');
    for (const required of ['sampler.dc.html', 'dist/guidelines/', 'get_guideline'])
      expect(readme).toContain(required);
  });

  it('opens with a Start here section that sets up the skeleton the export ships', async () => {
    const readme = await readFile(path.join(outDir, 'README.md'), 'utf8');
    const sections = readme.split('\n').filter(line => line.startsWith('## '));
    expect(sections[0]).toBe('## Start here');
    const start = readme.slice(readme.indexOf('## Start here'), readme.indexOf(sections[1]!));
    for (const required of [
      `(${SKELETON_FILE})`,
      `project/${CANVAS_SKELETON}`,
      SKELETON_DATA,
      ...CANVAS_HEAD.replaceAll(CANVAS_FOLDER, '<folder>').split('\n'),
      JSON.stringify(boardEntry(skeleton, CANVAS_SKELETON).entry)
        .slice(1, -1)
        .replaceAll(/([:,])/g, '$1 '),
    ])
      expect(start).toContain(required);
    // test:export runs after `export`, so the shipped project is on disk.
    expect(existsSync(path.resolve('.claude-design/project', SKELETON_FILE))).toBe(true);
  });

  it('only advertises default-open for overlays that have defaultOpen', async () => {
    const readme = await readFile(path.join(outDir, 'README.md'), 'utf8');
    const props = (name: string) =>
      new Set(
        metadata.components.find(component => component.name === name)?.props.map(p => p.name),
      );
    for (const name of DEFAULT_OPEN) {
      expect(props(name).has('defaultOpen'), name).toBe(true);
      expect(readme).toContain(name);
    }
    for (const name of CONTROLLED_OPEN) {
      expect(props(name).has('defaultOpen'), name).toBe(false);
      expect(props(name).has('open') && props(name).has('onOpenChange'), name).toBe(true);
    }
    expect(readme).toContain(`- ${DEFAULT_OPEN.join(', ')}: \`default-open="{{shown}}"\``);
  });

  it('corrects CVA booleans, reads current source defaults and kebab-cases attributes', async () => {
    const readme = await readFile(path.join(outDir, 'components/Button/README.md'), 'utf8');
    expect(readme).toContain('| `loading` | `boolean` |');
    expect(readme).toContain('| `full-width` | `boolean` |');
    expect(readme).toMatch(/\| `variant` \|[^\n]+\| `primary` \|/);
    expect(readme).not.toContain('stale-metadata-default');
  });

  it('lists every metadata story of a guided component', async () => {
    for (const component of metadata.components) {
      if (CLAUDE_DESIGN.internal.has(component.name)) continue;
      const guides = CLAUDE_DESIGN.splitByStoryFile.has(component.name)
        ? [...new Set(component.examples.map(example => guideName(example.storyFile ?? '')))]
        : [component.name];
      const text = (await Promise.all(guides.map(guideText))).join('\n');
      for (const example of component.examples)
        expect(text, `${component.name}/${example.name}`).toContain(`\n### ${example.name}\n`);
    }
  });

  it('Table guide shows the master-cell, pinning, row-drag, editing, context-menu, nested, grouping and selection stories', async () => {
    const readme = await readFile(path.join(outDir, 'components/Table/README.md'), 'utf8');
    for (const story of [
      'MasterCellWithActions',
      'ColumnPinning',
      'RowReordering',
      'InlineCellEditing',
      'ContextMenu',
      'RowExpanding',
      'RowGrouping',
      'RowSelection',
    ]) {
      expect(readme).toContain(`\n### ${story}\n`);
      expect(readme).toContain(`Source: Table/Table.stories.tsx#${story}`);
    }
  });

  it('Table sources go to stories.md', async () => {
    const readme = await readFile(path.join(outDir, 'components/Table/README.md'), 'utf8');
    const stories = await readFile(path.join(outDir, 'components/Table/stories.md'), 'utf8');
    expect(Buffer.byteLength(readme)).toBeLessThanOrEqual(64_000);
    expect(readme).toContain('./stories.md');
    expect(stories).toContain('Table/mocks.tsx');
    expect(stories).toContain(
      await readFile(
        path.join(DESIGN_SYSTEM_DIR, 'src/components/Table/Table.stories.tsx'),
        'utf8',
      ),
    );
  });

  it('ships every non-public relative import', async () => {
    const stories = await readFile(path.join(outDir, 'components/Table/stories.md'), 'utf8');
    expect(stories).toContain('### Table/mocks.tsx');
    expect(stories).toContain(
      await readFile(path.join(DESIGN_SYSTEM_DIR, 'src/components/Table/mocks.tsx'), 'utf8'),
    );
    expect(stories).not.toContain('### Table/Table.tsx');
  });

  it('splits SimpleCharts per story file', () => {
    for (const name of [
      'LineChart',
      'Metric',
      'PieChart',
      'BarList',
      'AreaChart',
      'ColumnChart',
      'HorizontalBarStack',
      'Chart',
      'Overview',
    ])
      expect(components).toContain(name);
    expect(components).not.toContain('SimpleCharts');
  });

  it("lists a split guide's own family parts", async () => {
    const readme = await readFile(path.join(outDir, 'components/LineChart/README.md'), 'utf8');
    expect(readme).toContain('- `WallarmDS.LineChartZoomBrush`');
    expect(readme).not.toContain('- `WallarmDS.MetricValue`');
    expect(readme).not.toContain('- `WallarmDS.LineChart` ');
  });

  it('heads every Template.bind story in its guide', async () => {
    expect(await guideText('HorizontalBarStack')).toContain('\n### NoDelta\n');
    expect(await guideText('FilterInput')).toContain('\n### WithDeleteButton\n');
  });

  it('no fallback prose and no recipes', async () => {
    for (const component of components) {
      const text = await guideText(component);
      for (const forbidden of [
        'is a Wallarm design-system component',
        '## When to use',
        'WallarmToastExample',
        'WallarmExample',
        '## Collections',
        'TableCells',
      ])
        expect(text, `${component}: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it('lists components without stories and internals in Not synced', async () => {
    const readme = await readFile(path.join(outDir, 'README.md'), 'utf8');
    for (const name of ['NavRail', 'TopHeader', 'BulkBar'])
      expect(readme).toContain(`- ${name}: no Storybook story; props only.`);
    expect(readme).toContain('- ThemeProvider: provider; use WallarmDS.Root on the canvas.');
    expect(readme).toContain('- DateFormatProvider: provider; use WallarmDS.Root on the canvas.');
    expect(readme).toContain('- Checkmark: internal primitive; no guide.');
  });

  it('ships barrel re-export targets', async () => {
    expect(await guideText('AppShell')).toContain('### AppShell/story-content/_storyRouter.tsx\n');
    expect(await guideText('FileUpload')).toContain('### FileUpload/lib/formatFileSize.ts\n');
  });

  it('lists story files outside component guides in Not synced', async () => {
    const readme = await readFile(path.join(outDir, 'README.md'), 'utf8');
    expect(readme).toContain('- src/theme/Pixel.stories.tsx: theme gallery story');
    expect(readme).toContain('- src/icons/module/Icons.stories.tsx: icon gallery story');
  });

  it('omits internal primitives and stays within the declaration budget', async () => {
    for (const name of CLAUDE_DESIGN.internal) {
      expect(components).not.toContain(name);
      await expect(stat(path.join(outDir, `components/${name}/README.md`))).rejects.toThrow();
    }
    expect(components).toContain('BulkBar');
    const declarations = await readFile(path.join(outDir, 'components/index.d.ts'), 'utf8');
    expect(declarations).toContain('ButtonProps');
    expect(Buffer.byteLength(declarations)).toBeLessThanOrEqual(1_500_000);
  });
});

describe('drop guard', () => {
  it('throws when a guide misses an exported story unless Not synced lists it', () => {
    expect(() => assertStoriesShipped('X', ['Basic', 'Sizes'], ['Basic'], [])).toThrow(
      "X: guide stories do not match its story files' exports (missing: Sizes; unknown: none).",
    );
    expect(() =>
      assertStoriesShipped('X', ['Basic', 'Sizes'], ['Basic'], ['X/Sizes: reason']),
    ).not.toThrow();
    expect(() =>
      assertStoriesShipped('X', ['Basic', 'Sizes'], ['Sizes', 'Basic'], []),
    ).not.toThrow();
    expect(() => assertStoriesShipped('X', ['Basic'], ['Basic', 'Other'], [])).toThrow(
      'unknown: Other',
    );
  });

  it('fails the build when metadata lacks an exported story', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'wallarm-canvas-guard-'));
    const metadata: DesignSystemMetadata = JSON.parse(
      await readFile(path.join(DESIGN_SYSTEM_DIR, 'dist/metadata/components.json'), 'utf8'),
    );
    const button = metadata.components.find(component => component.name === 'Button');
    if (button) button.examples = button.examples.filter(example => example.name !== 'Sizes');
    const metadataPath = path.join(outDir, 'metadata.json');
    await writeFile(metadataPath, JSON.stringify(metadata));
    await expect(buildDocs({ outDir, metadataPath, notSynced: [] })).rejects.toThrow(
      'Button: guide stories do not match',
    );
  });
});

describe('storyGuide', () => {
  it('fences verbatim sources longer than any backtick run inside them', () => {
    const text = 'export const md = `\n```js\nx\n```\n`;\n';
    const { readme } = storyGuide({
      name: 'X',
      reference: '',
      stories: [],
      modules: [{ path: 'X/X.stories.tsx', text }],
    });
    const fence = '`'.repeat(4);
    expect(readme).toContain(`### X/X.stories.tsx\n\n${fence}tsx\n${text}${fence}\n`);
  });
});

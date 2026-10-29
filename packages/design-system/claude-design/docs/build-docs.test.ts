import { beforeAll, describe, expect, it } from '@rstest/core';
import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildDocs } from './build-docs';
import { toCanvasExample } from './component-readme';

describe('Claude Design documentation', () => {
  let outDir: string;
  let components: string[];

  beforeAll(async () => {
    outDir = await mkdtemp(path.join(tmpdir(), 'wallarm-canvas-docs-'));
    const metadata: DesignSystemMetadata = JSON.parse(
      await readFile('dist/metadata/components.json', 'utf8'),
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
      'WallarmDS.TableCells',
      'x-import',
      'theme="dark"',
      'Example intentionally skipped token',
    ]) {
      expect(readme).toContain(required);
    }
    expect(readme).not.toContain('components/lib/react');
  });

  it('corrects CVA booleans, reads current source defaults and kebab-cases attributes', async () => {
    const readme = await readFile(path.join(outDir, 'components/Button/README.md'), 'utf8');
    expect(readme).toContain('| `loading` | `boolean` |');
    expect(readme).toContain('| `full-width` | `boolean` |');
    expect(readme).toMatch(/\| `variant` \|[^\n]+\| `primary` \|/);
    expect(readme).not.toContain('stale-metadata-default');
    expect(readme).toContain('component-from-global-scope="WallarmDS.Button"');
  });

  it('gives collection and lifecycle recipes instead of invalid JSX wrappers', async () => {
    for (const name of ['Select', 'FilterDropdown']) {
      const readme = await readFile(path.join(outDir, `components/${name}/README.md`), 'utf8');
      expect(readme).toContain('## Collections');
      expect(readme).toContain('WallarmDS.createListCollection');
      expect(readme).toContain('collection="{{collection}}"');
      expect(readme).not.toContain('skillsWithoutIcons');
    }
    const toast = await readFile(path.join(outDir, 'components/Toast/README.md'), 'utf8');
    expect(toast).toContain('not mountable via x-import');
    expect(toast).toContain('componentDidMount');
    expect(toast).toContain('WallarmDS.Toaster');
    expect(toast).toContain('WallarmDS.toaster.create');
    const tour = await readFile(path.join(outDir, 'components/Tour/README.md'), 'utf8');
    expect(tour).toContain('not mountable via x-import');
  });

  it('omits provider and internal cards and stays within the declaration budget', async () => {
    for (const name of [
      'ThemeProvider',
      'DateFormatProvider',
      'ButtonBase',
      'Polymorphic',
      'TemporalCore',
      'Checkmark',
      'BulkBar',
      'NavPanel',
      'SimpleCharts',
    ]) {
      expect(components).not.toContain(name);
      await expect(stat(path.join(outDir, `components/${name}/README.md`))).rejects.toThrow();
    }
    const declarations = await readFile(path.join(outDir, 'components/index.d.ts'), 'utf8');
    expect(declarations).toContain('ButtonProps');
    expect(Buffer.byteLength(declarations)).toBeLessThanOrEqual(1_500_000);
  });

  it('gives every supported component at least one complete canvas example', async () => {
    for (const component of components.filter(name => name !== 'Tour')) {
      const readme = await readFile(path.join(outDir, `components/${component}/README.md`), 'utf8');
      expect(readme, component).toContain('component-from-global-scope=');
    }
  });
});

describe('canvas examples', () => {
  it('keeps boolean and numeric values as renderVals values', () => {
    const result = toCanvasExample(`import { Button } from '@wallarm-org/design-system/Button';
      export const Loading = () => <Button loading={false} fullWidth tabIndex={0}>Save rule</Button>;`);
    expect(result).toContain('loading="{{value1}}"');
    expect(result).toContain('full-width="{{value2}}"');
    expect(result).toContain('value1: false');
    expect(result).toContain('value2: true');
    expect(result).toContain('value3: 0');
  });

  it('rejects stories with missing imports, variables or runtime context', () => {
    expect(toCanvasExample('export const Basic = () => <ToastDemo />;')).toBeUndefined();
    expect(
      toCanvasExample(`import { Text } from '@wallarm-org/design-system/Text';
      export const Basic = () => <Text>{sampleText}</Text>;`),
    ).toBeUndefined();
    expect(
      toCanvasExample(`import { Select } from '@wallarm-org/design-system/Select';
      export const Basic = () => <Select collection={missingCollection} />;`),
    ).toBeUndefined();
    expect(
      toCanvasExample(`import { Button } from '@wallarm-org/design-system/Button';
      export const Basic = args => <Button {...args} />;`),
    ).toBeUndefined();
  });
});

import { describe, expect, it } from '@rstest/core';
import { Project } from 'ts-morph';
import { findStoryFiles, readStoryTitle, toCopyableCode } from '../story-source.js';

const SRC = '/src';

const setup = (files: Record<string, string>) => {
  const project = new Project({ useInMemoryFileSystem: true });
  for (const [file, text] of Object.entries(files)) project.createSourceFile(file, text);
  return project;
};

const INDEXES = {
  '/src/components/Button/index.ts': "export { Button } from './Button';",
  '/src/components/Button/Button.ts': 'export const Button = 1;',
  '/src/components/Stack/index.ts': "export { VStack, HStack } from './Stack';",
  '/src/components/Stack/Stack.ts': 'export const VStack = 1; export const HStack = 1;',
  '/src/components/FilterInput/index.ts': "export { FilterInput } from './FilterInput';",
  '/src/components/FilterInput/FilterInput.ts': 'export const FilterInput = 1;',
  '/src/components/FilterInputChip/ConnectorChip.ts': 'export const ConnectorChip = 1;',
  '/src/icons/index.ts': 'export const Plus = 1;',
  '/src/index.ts': 'export const Thing = 1;',
  '/src/utils/cn.ts': 'export const cn = 1;',
};

const convert = (file: string, text: string, name: string, code: string) => {
  const project = setup({ ...INDEXES, [file]: text });
  return toCopyableCode(project.getSourceFileOrThrow(file), name, code, SRC);
};

describe('toCopyableCode', () => {
  it('strips args param and spread', () => {
    const code = "({ ...args }) => (\n  <Button {...args} size='sm'>Go</Button>\n)";
    const out = convert('/src/components/Button/Button.stories.tsx', '', 'Basic', code);
    expect(out).toContain('export const Basic = () => (');
    expect(out).toContain("<Button size='sm'>Go</Button>");
    expect(out).not.toContain('args');
  });

  it('emits only used imports, merged and ordered', () => {
    const file = '/src/components/Button/Button.stories.tsx';
    const text = `import { Button } from './index';
import { useState, useEffect } from 'react';
import { fn } from 'storybook/test';
import type { Meta } from 'storybook-react-rsbuild';`;
    const out = convert(
      file,
      text,
      'Basic',
      '() => { const [a] = useState(fn); return <Button /> }',
    );
    expect(out.split('\n\n')[0]).toBe(
      "import { useState } from 'react';\nimport { Button } from '@wallarm-org/design-system/Button';",
    );
  });

  it('rewrites imports from a stories/ subfolder', () => {
    const text = `import { FilterInput } from '../FilterInput';
import { VStack } from '../../Stack';`;
    const out = convert(
      '/src/components/FilterInput/stories/X.stories.tsx',
      text,
      'A',
      '() => <VStack><FilterInput /></VStack>',
    );
    expect(out).toContain("from '@wallarm-org/design-system/FilterInput'");
    expect(out).toContain("from '@wallarm-org/design-system/Stack'");
  });

  it('keeps non-exported names relative', () => {
    const text = `import { ConnectorChip } from '../../FilterInputChip/ConnectorChip';
import { rows } from './mocks';`;
    const out = convert(
      '/src/components/FilterInput/stories/X.stories.tsx',
      text,
      'A',
      '() => <ConnectorChip rows={rows} />',
    );
    expect(out).toContain("from '../../FilterInputChip/ConnectorChip'");
    expect(out).toContain("from './mocks'");
  });

  it('maps icons, root index and utils', () => {
    const text = `import { Plus } from '../../icons';
import { Thing } from '../../index';
import { cn } from '../../utils/cn';`;
    const out = convert(
      '/src/components/Button/Button.stories.tsx',
      text,
      'A',
      '() => <Plus className={cn(Thing)} />',
    );
    expect(out).toContain("from '@wallarm-org/design-system/icons'");
    expect(out).toContain("from '@wallarm-org/design-system';");
    expect(out).toContain("from '@wallarm-org/design-system/utils/cn'");
  });
});

describe('readStoryTitle', () => {
  it('reads meta title', () => {
    const project = setup({
      '/a.stories.tsx': `const meta = { title: 'Patterns/FilterInput/Composition' } satisfies Meta<unknown>;
export default meta;`,
    });
    expect(readStoryTitle(project.getSourceFileOrThrow('/a.stories.tsx'))).toBe(
      'Patterns/FilterInput/Composition',
    );
  });
});

describe('findStoryFiles', () => {
  it('puts the main file first', () => {
    const project = setup({
      '/c/FilterInput/FilterInput.stories.tsx': '',
      '/c/FilterInput/stories/B.stories.tsx': '',
      '/c/FilterInput/stories/A.stories.tsx': '',
      '/c/FilterInput/stories/mocks.ts': '',
    });
    expect(findStoryFiles(project, '/c/FilterInput')).toEqual([
      '/c/FilterInput/FilterInput.stories.tsx',
      '/c/FilterInput/stories/A.stories.tsx',
      '/c/FilterInput/stories/B.stories.tsx',
    ]);
  });
});

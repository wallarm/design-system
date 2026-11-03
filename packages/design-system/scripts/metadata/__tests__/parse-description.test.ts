import path from 'path';

import { describe, expect, it } from '@rstest/core';
import { Project } from 'ts-morph';

import { parseComponentDescription, readMetaDescription } from '../parse-description.js';

const SRC = path.resolve(import.meta.dirname, '../../../src/components');
const project = new Project({ tsConfigFilePath: path.resolve(SRC, '../../tsconfig.app.json') });
const memory = new Project({ useInMemoryFileSystem: true });
const dir = (name: string) => path.join(SRC, name);

describe('parseComponentDescription', () => {
  it('prefers the meta docs.description.component', () => {
    expect(parseComponentDescription(project, dir('Button'), 'Button')).toMatch(
      /^Triggers an action — reach for `Link`/,
    );
  });

  it('resolves DESCRIPTION arrays joined with spaces', () => {
    expect(parseComponentDescription(project, dir('Button'), 'Button')).toContain(
      "one slot. Keep one `variant='primary'`",
    );
  });

  it('reads a concatenated meta description', () => {
    expect(parseComponentDescription(project, dir('EmptyState'), 'EmptyState')).toMatch(
      /^EmptyState communicates that a space has no content/,
    );
  });

  it("does not take a sibling component's story meta for a multi-file family", () => {
    // No SimpleCharts.stories.tsx and no SimpleCharts JSDoc; AreaChart's meta must not leak in.
    expect(parseComponentDescription(project, dir('SimpleCharts'), 'SimpleCharts')).toBeUndefined();
  });

  it('uses the only story file when there is exactly one', () => {
    memory.createSourceFile(
      '/c/One/stories/Other.stories.tsx',
      "const meta = { parameters: { docs: { description: { component: 'Only.' } } } }; export default meta;",
      { overwrite: true },
    );
    expect(parseComponentDescription(memory, '/c/One', 'One')).toBe('Only.');
  });

  it('falls back to JSDoc with several story files and none named for the component', () => {
    for (const n of ['A', 'B']) {
      memory.createSourceFile(
        `/c/Many/${n}.stories.tsx`,
        `const meta = { parameters: { docs: { description: { component: '${n}.' } } } }; export default meta;`,
        { overwrite: true },
      );
    }
    memory.createSourceFile('/c/Many/Many.tsx', '/** Many. */\nexport const Many = () => null;', {
      overwrite: true,
    });
    expect(parseComponentDescription(memory, '/c/Many', 'Many')).toBe('Many.');
  });

  it('omits the description when neither meta nor named JSDoc exists', () => {
    memory.createSourceFile('/c/Foo/Foo.tsx', 'export const Foo = () => null;', {
      overwrite: true,
    });
    expect(parseComponentDescription(memory, '/c/Foo', 'Foo')).toBeUndefined();
  });

  it('falls back to the doc comment opening index.ts', () => {
    memory.createSourceFile(
      '/c/Parts/index.ts',
      "/**\n * Parts of a bar.\n */\nexport { PartA } from './PartA';",
      { overwrite: true },
    );
    expect(parseComponentDescription(memory, '/c/Parts', 'Parts')).toBe('Parts of a bar.');
  });

  it('uses the JSDoc of the component itself', () => {
    memory.createSourceFile('/c/Bar/Bar.tsx', '/** The bar. */\nexport const Bar = () => null;', {
      overwrite: true,
    });
    expect(parseComponentDescription(memory, '/c/Bar', 'Bar')).toBe('The bar.');
  });

  it('ignores JSDoc on a helper that is not the component', () => {
    memory.createSourceFile(
      '/c/Baz/Baz.tsx',
      '/** helper */\nconst x = 1;\nexport const Baz = () => null;',
      { overwrite: true },
    );
    expect(parseComponentDescription(memory, '/c/Baz', 'Baz')).toBeUndefined();
  });
});

describe('readMetaDescription', () => {
  let i = 0;
  it('reads literal, template, concatenation and join forms', () => {
    for (const expr of [`'A b'`, '`A b`', `'A' + ' b'`, `['A', 'b'].join(' ')`]) {
      const sf = memory.createSourceFile(
        `/m${i++}.stories.tsx`,
        `const meta = { parameters: { docs: { description: { component: ${expr} } } } }; export default meta;`,
      );
      expect(readMetaDescription(sf)).toBe('A b');
    }
  });

  it('returns undefined for unsupported expressions', () => {
    const sf = memory.createSourceFile(
      `/m${i++}.stories.tsx`,
      'const meta = { parameters: { docs: { description: { component: fn() } } } }; export default meta;',
    );
    expect(readMetaDescription(sf)).toBeUndefined();
  });
});

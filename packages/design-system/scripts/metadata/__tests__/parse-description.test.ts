import { describe, expect, it } from '@rstest/core';
import path from 'path';
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

  it('omits the description when neither meta nor named JSDoc exists', () => {
    memory.createSourceFile('/c/Foo/Foo.tsx', 'export const Foo = () => null;', {
      overwrite: true,
    });
    expect(parseComponentDescription(memory, '/c/Foo', 'Foo')).toBeUndefined();
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

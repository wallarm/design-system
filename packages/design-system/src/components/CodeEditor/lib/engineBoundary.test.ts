import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const EDITOR_DIR = join(__dirname, '..');

/** Files in the main chunk: they may reference the engine only through `import type` or `loadEngine`. */
const MAIN_CHUNK_FILES = [
  'index.ts',
  'types.ts',
  'CodeEditorRoot.tsx',
  'CodeEditorContent.tsx',
  'CodeEditorContext.ts',
  'classes.ts',
  'hooks/useCodeEditor.ts',
  'lib/keyboardHint.ts',
  'lib/splitContentProps.ts',
  'lib/portalRegistry.ts',
  'lib/PortalOutlet.tsx',
];

const STATIC_IMPORT = /^import\s+(?!type\b)[^;]*?from\s+'([^']+)'/gm;
const FORBIDDEN = /(^|\/)engine(\/|$)|^@codemirror\/|^@lezer\/|^json-schema-library$/;

describe('engine chunk boundary', () => {
  it.each(MAIN_CHUNK_FILES)('%s has no static runtime import of the engine', file => {
    const source = readFileSync(join(EDITOR_DIR, file), 'utf8');
    const runtimeImports = [...source.matchAll(STATIC_IMPORT)].map(match => match[1] ?? '');

    expect(runtimeImports.filter(specifier => FORBIDDEN.test(specifier))).toEqual([]);
  });

  it('lib/loadEngine.ts reaches the engine only through a dynamic import', () => {
    const source = readFileSync(join(EDITOR_DIR, 'lib/loadEngine.ts'), 'utf8');

    expect([...source.matchAll(STATIC_IMPORT)]).toEqual([]);
    expect(source).toContain("import('../engine')");
  });
});

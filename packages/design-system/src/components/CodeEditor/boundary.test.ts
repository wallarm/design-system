import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

/**
 * Main-chunk import boundary (spec §3 / plan Global Constraints).
 *
 * Everything outside `engine/` ships in the consumer's main chunk. It may reach
 * CodeMirror, Lezer, json-schema-library or `engine/` only through `import type`
 * (erased at build time) or through `lib/loadEngine.ts`'s `import('../engine')`.
 * `json-schema-library` is reachable only through `engine/schema/loadSchema.ts`'s
 * `import('json-schema-library')`, so it stays a second, schema-only chunk.
 *
 * The check is textual on purpose: rslib runs with `bundle: false`, so every
 * source import survives 1:1 in `dist/`, and a regex over the source is exactly
 * what the consumer's bundler will see.
 */

const EDITOR_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_DIR = path.join(EDITOR_DIR, 'engine');

const HEAVY_PACKAGE = /^(@codemirror\/|@lezer\/|@babel\/parser(\/|$)|json-schema-library(\/|$))/;
const SCHEMA_PACKAGE = /^json-schema-library(\/|$)/;

/**
 * Packages that form their own lazy chunks: each may be value-imported only
 * dynamically, and only from the one engine file named here.
 */
const LAZY_CHUNKS: ReadonlyArray<{ pattern: RegExp; loader: string }> = [
  { pattern: /^@babel\/parser(\/|$)/, loader: 'engine/babelSyntax.ts' },
  { pattern: /^@codemirror\/lang-javascript$/, loader: 'engine/languages/index.ts' },
  { pattern: /^@codemirror\/lang-python$/, loader: 'engine/languages/index.ts' },
  { pattern: /^@codemirror\/legacy-modes(\/|$)/, loader: 'engine/languages/index.ts' },
  { pattern: /^luaparse$/, loader: 'engine/luaSyntax.ts' },
];

/** Files the Global Constraints name explicitly; the scan below must find them all. */
const REQUIRED_MAIN_CHUNK_FILES = [
  'CodeEditorRoot.tsx',
  'CodeEditorContent.tsx',
  'CodeEditorContext.ts',
  'types.ts',
  'index.ts',
  'hooks/useCodeEditor.ts',
  'lib/loadEngine.ts',
];

interface ImportRecord {
  specifier: string;
  typeOnly: boolean;
  dynamic: boolean;
  statement: string;
}

const STATIC_IMPORT = /^[ \t]*import\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]/gm;
const SIDE_EFFECT_IMPORT = /^[ \t]*import\s*['"]([^'"]+)['"]/gm;
const RE_EXPORT =
  /^[ \t]*export\s+(type\s+)?(\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Drops comment lines (`//`, `/*`, ` *`) so JSDoc examples never count as imports. */
const stripCommentLines = (source: string): string =>
  source
    .split('\n')
    .filter(line => !/^\s*(\/\/|\/\*|\*)/.test(line))
    .join('\n');

const collectImports = (rawSource: string): ImportRecord[] => {
  const source = stripCommentLines(rawSource);
  const records: ImportRecord[] = [];
  for (const match of source.matchAll(STATIC_IMPORT)) {
    records.push({
      specifier: match[3] ?? '',
      typeOnly: match[1] !== undefined,
      dynamic: false,
      statement: match[0].trim(),
    });
  }
  for (const match of source.matchAll(SIDE_EFFECT_IMPORT)) {
    records.push({
      specifier: match[1] ?? '',
      typeOnly: false,
      dynamic: false,
      statement: match[0].trim(),
    });
  }
  for (const match of source.matchAll(RE_EXPORT)) {
    records.push({
      specifier: match[3] ?? '',
      typeOnly: match[1] !== undefined,
      dynamic: false,
      statement: match[0].trim(),
    });
  }
  for (const match of source.matchAll(DYNAMIC_IMPORT)) {
    records.push({
      specifier: match[1] ?? '',
      typeOnly: false,
      dynamic: true,
      statement: match[0].trim(),
    });
  }
  return records;
};

const resolvesIntoEngine = (fromFile: string, specifier: string): boolean => {
  if (!specifier.startsWith('.')) return false;
  const target = path.resolve(path.dirname(fromFile), specifier);
  return target === ENGINE_DIR || target.startsWith(`${ENGINE_DIR}${path.sep}`);
};

const isHeavy = (fromFile: string, specifier: string): boolean =>
  HEAVY_PACKAGE.test(specifier) || resolvesIntoEngine(fromFile, specifier);

/**
 * Violations for a main-chunk file: any value (non-`import type`) import or
 * re-export of a heavy module, and any dynamic import of one — except
 * `lib/loadEngine.ts`'s `import('../engine')`.
 */
const findMainChunkViolations = (filePath: string, source: string): string[] => {
  const isLoader = filePath === path.join(EDITOR_DIR, 'lib', 'loadEngine.ts');
  return collectImports(source)
    .filter(record => isHeavy(filePath, record.specifier))
    .filter(record => !record.typeOnly)
    .filter(record => !(record.dynamic && isLoader && record.specifier === '../engine'))
    .map(record => `${path.relative(EDITOR_DIR, filePath)}: ${record.statement}`);
};

/**
 * Violations for json-schema-library anywhere in CodeEditor: only
 * `engine/schema/loadSchema.ts` may import it, and only dynamically.
 */
const findSchemaLibraryViolations = (filePath: string, source: string): string[] => {
  const isSchemaLoader = filePath === path.join(ENGINE_DIR, 'schema', 'loadSchema.ts');
  return collectImports(source)
    .filter(record => SCHEMA_PACKAGE.test(record.specifier))
    .filter(record => !record.typeOnly)
    .filter(record => !(record.dynamic && isSchemaLoader))
    .map(record => `${path.relative(EDITOR_DIR, filePath)}: ${record.statement}`);
};

/**
 * Violations for the extra lazy chunks (@babel/parser, lang-javascript, lang-python):
 * only their designated loader may import them, and only dynamically.
 */
const findLazyChunkViolations = (filePath: string, source: string): string[] => {
  const relativePath = path.relative(EDITOR_DIR, filePath).split(path.sep).join('/');
  return collectImports(source)
    .filter(record => LAZY_CHUNKS.some(({ pattern }) => pattern.test(record.specifier)))
    .filter(record => !record.typeOnly)
    .filter(
      record =>
        !(
          record.dynamic &&
          LAZY_CHUNKS.some(
            ({ pattern, loader }) => pattern.test(record.specifier) && loader === relativePath,
          )
        ),
    )
    .map(record => `${relativePath}: ${record.statement}`);
};

const isSourceFile = (name: string): boolean =>
  /\.(ts|tsx)$/.test(name) && !/\.(test|stories|e2e)\.(ts|tsx)$/.test(name);

const walk = (dir: string, found: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.endsWith('-snapshots')) walk(full, found);
    } else if (isSourceFile(entry.name)) {
      found.push(full);
    }
  }
  return found;
};

const allSourceFiles = walk(EDITOR_DIR);
const mainChunkFiles = allSourceFiles.filter(
  file => !(file === ENGINE_DIR || file.startsWith(`${ENGINE_DIR}${path.sep}`)),
);
const read = (file: string): string => fs.readFileSync(file, 'utf8');

describe('CodeEditor import boundary', () => {
  describe('detector', () => {
    const root = path.join(EDITOR_DIR, 'CodeEditorRoot.tsx');
    const loader = path.join(EDITOR_DIR, 'lib', 'loadEngine.ts');
    const hook = path.join(EDITOR_DIR, 'hooks', 'useCodeEditor.ts');

    it('flags static value imports of CodeMirror, Lezer and json-schema-library', () => {
      const source = [
        "import { EditorView } from '@codemirror/view';",
        "import { tags } from '@lezer/highlight';",
        "import { compileSchema } from 'json-schema-library';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toHaveLength(3);
    });

    it('flags multi-line, side-effect, namespace and inline-type imports', () => {
      const source = [
        'import {',
        '  EditorState,',
        '  type Extension,',
        "} from '@codemirror/state';",
        "import '@codemirror/view';",
        "import * as lr from '@lezer/lr';",
        "import { type EditorHandle } from './engine/types';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toHaveLength(4);
    });

    it('flags value imports and re-exports that resolve into engine/', () => {
      const source = [
        "import { createEditor } from './engine';",
        "export { createEditor } from './engine/index';",
        "export * from './engine/positions';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toHaveLength(3);
      expect(
        findMainChunkViolations(hook, "import { createEditor } from '../engine';"),
      ).toHaveLength(1);
    });

    it('allows import type, export type and unrelated relative paths', () => {
      const source = [
        "import type { EditorView } from '@codemirror/view';",
        "import type { EditorHandle, EngineOptions } from './engine/types';",
        "export type { EditorHandle } from './engine/types';",
        "import { cn } from '../../utils/cn';",
        "import { CodeSnippetFrame } from '../CodeSnippet/internal/CodeSnippetFrame';",
        "import { enginePlaceholder } from './engineless';",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toEqual([]);
    });

    it("allows import('../engine') only in lib/loadEngine.ts", () => {
      const source = "export const loadEngine = () => import('../engine');";
      expect(findMainChunkViolations(loader, source)).toEqual([]);
      expect(findMainChunkViolations(hook, source)).toHaveLength(1);
      expect(findMainChunkViolations(loader, "const m = import('@codemirror/view');")).toHaveLength(
        1,
      );
    });

    it('allows the extra lazy chunks only as dynamic imports in their loaders', () => {
      const babel = path.join(ENGINE_DIR, 'babelSyntax.ts');
      const languages = path.join(ENGINE_DIR, 'languages', 'index.ts');
      const dyn = (spec: string) => `const m = import('${spec}');`;
      expect(findLazyChunkViolations(babel, dyn('@babel/parser'))).toEqual([]);
      expect(findLazyChunkViolations(languages, dyn('@codemirror/lang-python'))).toEqual([]);
      expect(findLazyChunkViolations(languages, dyn('@babel/parser'))).toHaveLength(1);
      expect(findLazyChunkViolations(babel, "import { parse } from '@babel/parser';")).toHaveLength(
        1,
      );
      expect(
        findLazyChunkViolations(languages, "import { python } from '@codemirror/lang-python';"),
      ).toHaveLength(1);
      expect(
        findLazyChunkViolations(babel, "import type { ParserOptions } from '@babel/parser';"),
      ).toEqual([]);
      const lua = path.join(ENGINE_DIR, 'luaSyntax.ts');
      expect(findLazyChunkViolations(languages, dyn('@codemirror/legacy-modes/mode/lua'))).toEqual(
        [],
      );
      expect(findLazyChunkViolations(lua, dyn('luaparse'))).toEqual([]);
      expect(findLazyChunkViolations(lua, "import { parse } from 'luaparse';")).toHaveLength(1);
      expect(findLazyChunkViolations(babel, dyn('luaparse'))).toHaveLength(1);
      expect(
        findLazyChunkViolations(
          languages,
          "import { lua } from '@codemirror/legacy-modes/mode/lua';",
        ),
      ).toHaveLength(1);
    });

    it('ignores imports mentioned inside JSDoc comments', () => {
      const source = [
        '/**',
        " * import { EditorView } from '@codemirror/view';",
        ' */',
        "// import { EditorView } from '@codemirror/view';",
        " * Loaded lazily via import('../engine') on first mount.",
      ].join('\n');
      expect(findMainChunkViolations(root, source)).toEqual([]);
    });

    it('allows json-schema-library only as a dynamic import in engine/schema/loadSchema.ts', () => {
      const schemaLoader = path.join(ENGINE_DIR, 'schema', 'loadSchema.ts');
      const validate = path.join(ENGINE_DIR, 'schema', 'validate.ts');
      const dynamic = "export const load = () => import('json-schema-library');";
      const stat = "import { compileSchema } from 'json-schema-library';";
      const typeOnly = "import type { SchemaNode } from 'json-schema-library';";
      expect(findSchemaLibraryViolations(schemaLoader, dynamic)).toEqual([]);
      expect(findSchemaLibraryViolations(schemaLoader, stat)).toHaveLength(1);
      expect(findSchemaLibraryViolations(validate, dynamic)).toHaveLength(1);
      expect(findSchemaLibraryViolations(validate, typeOnly)).toEqual([]);
    });
  });

  describe('source tree', () => {
    it('scans every main-chunk file named in the Global Constraints', () => {
      const relative = mainChunkFiles.map(file =>
        path.relative(EDITOR_DIR, file).split(path.sep).join('/'),
      );
      for (const required of REQUIRED_MAIN_CHUNK_FILES) {
        expect(relative).toContain(required);
      }
      expect(relative.some(file => file.startsWith('engine/'))).toBe(false);
    });

    it('has no static value import of engine/, CodeMirror, Lezer or json-schema-library outside engine/', () => {
      const violations = mainChunkFiles.flatMap(file => findMainChunkViolations(file, read(file)));
      expect(violations).toEqual([]);
    });

    it("loads the engine through lib/loadEngine.ts's import('../engine')", () => {
      const source = read(path.join(EDITOR_DIR, 'lib', 'loadEngine.ts'));
      expect(source).toMatch(/\bimport\s*\(\s*['"]\.\.\/engine['"]\s*\)/);
    });

    it('imports @babel/parser, luaparse, legacy-modes, lang-javascript and lang-python only dynamically from their loaders', () => {
      const violations = allSourceFiles.flatMap(file => findLazyChunkViolations(file, read(file)));
      expect(violations).toEqual([]);
      const babel = read(path.join(ENGINE_DIR, 'babelSyntax.ts'));
      expect(babel).toMatch(/\bimport\s*\(\s*['"]@babel\/parser['"]\s*\)/);
      const languages = read(path.join(ENGINE_DIR, 'languages', 'index.ts'));
      expect(languages).toMatch(/\bimport\s*\(\s*['"]@codemirror\/lang-javascript['"]\s*\)/);
      expect(languages).toMatch(/\bimport\s*\(\s*['"]@codemirror\/lang-python['"]\s*\)/);
      expect(languages).toMatch(
        /\bimport\s*\(\s*['"]@codemirror\/legacy-modes\/mode\/lua['"]\s*\)/,
      );
      const lua = read(path.join(ENGINE_DIR, 'luaSyntax.ts'));
      expect(lua).toMatch(/\bimport\s*\(\s*['"]luaparse['"]\s*\)/);
    });

    it('imports json-schema-library only dynamically from engine/schema/loadSchema.ts', () => {
      const violations = allSourceFiles.flatMap(file =>
        findSchemaLibraryViolations(file, read(file)),
      );
      expect(violations).toEqual([]);
      const loader = read(path.join(ENGINE_DIR, 'schema', 'loadSchema.ts'));
      expect(loader).toMatch(/\bimport\s*\(\s*['"]json-schema-library['"]\s*\)/);
    });
  });
});

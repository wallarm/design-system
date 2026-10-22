import path from 'path';
import { type Node, type Project, type SourceFile, SyntaxKind } from 'ts-morph';

const PKG = '@wallarm-org/design-system';
const DROPPED = (spec: string) =>
  spec === 'storybook-react-rsbuild' || spec === 'storybook/test' || spec.startsWith('@storybook/');

/** Every `*.stories.tsx` under `componentDir`: `{Name}.stories.tsx` first, rest sorted. */
export const findStoryFiles = (project: Project, componentDir: string): string[] => {
  const fs = project.getFileSystem();
  const found = new Set<string>();

  const walk = (dir: string) => {
    if (!fs.directoryExistsSync(dir)) return;
    for (const entry of fs.readDirSync(dir)) {
      const full = path.join(dir, path.basename(entry.name));
      if (entry.isDirectory) walk(full);
      else if (entry.isFile && full.endsWith('.stories.tsx')) found.add(full);
    }
  };
  walk(componentDir);
  // Source files created in memory but never saved are invisible to the file system.
  for (const sf of project.getSourceFiles(`${componentDir}/**/*.stories.tsx`)) {
    found.add(sf.getFilePath());
  }
  const all = [...found];

  const main = path.join(componentDir, `${path.basename(componentDir)}.stories.tsx`);
  return [...all.filter(f => f === main), ...all.filter(f => f !== main).sort()];
};

const unwrap = (node: Node): Node => {
  let n = node;
  while (
    n.isKind(SyntaxKind.SatisfiesExpression) ||
    n.isKind(SyntaxKind.AsExpression) ||
    n.isKind(SyntaxKind.ParenthesizedExpression)
  ) {
    n = n.getExpression();
  }
  return n;
};

/** The `title` of the default-exported `meta` object. */
export const readStoryTitle = (sourceFile: SourceFile): string | undefined => {
  const assignment = sourceFile.getExportAssignment(a => !a.isExportEquals());
  if (!assignment) return undefined;

  let target = unwrap(assignment.getExpression());
  if (target.isKind(SyntaxKind.Identifier)) {
    const init = sourceFile.getVariableDeclaration(target.getText())?.getInitializer();
    if (!init) return undefined;
    target = unwrap(init);
  }
  if (!target.isKind(SyntaxKind.ObjectLiteralExpression)) return undefined;

  const title = target.getProperty('title');
  if (!title?.isKind(SyntaxKind.PropertyAssignment)) return undefined;
  const value = title.getInitializer();
  return value?.isKind(SyntaxKind.StringLiteral) ||
    value?.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
    ? value.getLiteralText()
    : undefined;
};

interface ImportEntry {
  def?: string;
  ns?: string;
  named: Set<string>;
}

/** Map a story-relative specifier to a public one, or return it unchanged. */
const toPublicSpecifier = (
  sourceFile: SourceFile,
  spec: string,
  importedNames: string[],
  srcDir: string,
): string => {
  const abs = path.resolve(path.dirname(sourceFile.getFilePath()), spec);
  const rel = path.relative(srcDir, abs).split(path.sep).join('/');

  if (rel === 'index') return PKG;
  if (rel === 'icons' || rel.startsWith('icons/')) return `${PKG}/icons`;
  if (rel.startsWith('utils/')) return `${PKG}/${rel}`;

  const comp = rel.match(/^components\/([^/]+)(?:\/|$)/)?.[1];
  if (comp) {
    const index = sourceFile
      .getProject()
      .addSourceFileAtPathIfExists(path.join(srcDir, 'components', comp, 'index.ts'));
    if (index) {
      const exported = new Set(index.getExportedDeclarations().keys());
      if (importedNames.length > 0 && importedNames.every(n => exported.has(n))) {
        return `${PKG}/${comp}`;
      }
    }
  }
  return spec;
};

const rank = (spec: string) =>
  spec === 'react' ? 0 : spec.startsWith('.') ? 3 : spec.startsWith(PKG) ? 2 : 1;

/** Paste-ready source: story code without args plus a public-import header. */
export const toCopyableCode = (
  sourceFile: SourceFile,
  exportName: string,
  storyCode: string,
  srcDir: string,
): string => {
  const isFn = /^(async\s+)?(function\b|\()/.test(storyCode.trim());
  const body = storyCode
    .replace(/^(\s*(?:async\s+)?)\((?:[^()]|\([^()]*\))*\)\s*(?::[^=]+)?=>/, '$1() =>')
    .replace(/\s*\{\.\.\.args\}/g, '');
  const code = isFn ? `export const ${exportName} = ${body};` : body;

  const used = (name: string) =>
    new RegExp(`(?<![\\w$])${name.replace(/\$/g, '\\$')}(?![\\w$])`).test(code);
  const imports = new Map<string, ImportEntry>();

  for (const decl of sourceFile.getImportDeclarations()) {
    const raw = decl.getModuleSpecifierValue();
    if (DROPPED(raw)) continue;

    const defName = decl.getDefaultImport()?.getText();
    const nsName = decl.getNamespaceImport()?.getText();
    const named = decl
      .getNamedImports()
      .filter(n => used(n.getAliasNode()?.getText() ?? n.getName()));
    const defUsed = defName && used(defName);
    const nsUsed = nsName && used(nsName);
    if (!defUsed && !nsUsed && named.length === 0) continue;

    const spec = raw.startsWith('.')
      ? toPublicSpecifier(
          sourceFile,
          raw,
          named.map(n => n.getName()).concat(defUsed ? ['default'] : [], nsUsed ? ['*'] : []),
          srcDir,
        )
      : raw;

    const entry = imports.get(spec) ?? { named: new Set<string>() };
    if (defUsed) entry.def = defName;
    if (nsUsed) entry.ns = nsName;
    for (const n of named) {
      const alias = n.getAliasNode()?.getText();
      const text = alias ? `${n.getName()} as ${alias}` : n.getName();
      entry.named.add(n.isTypeOnly() || decl.isTypeOnly() ? `type ${text}` : text);
    }
    imports.set(spec, entry);
  }

  const lines = [...imports.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || (rank(a) === 2 ? a.localeCompare(b) : 0))
    .flatMap(([spec, e]) => {
      const out: string[] = [];
      if (e.def || e.named.size > 0) {
        const parts = [e.def, e.named.size > 0 ? `{ ${[...e.named].join(', ')} }` : undefined];
        out.push(`import ${parts.filter(Boolean).join(', ')} from '${spec}';`);
      }
      if (e.ns) out.push(`import * as ${e.ns} from '${spec}';`);
      return out;
    });

  return lines.length > 0 ? `${lines.join('\n')}\n\n${code}` : code;
};

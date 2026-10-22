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

const hasWord = (text: string, name: string) =>
  new RegExp(`(?<![\\w$])${name.replace(/\$/g, '\\$')}(?![\\w$])`).test(text);

/**
 * For a function/arrow expression, drop the parameter list unless a bound
 * identifier is still referenced in the body. Returns undefined when the code
 * is not a function expression.
 */
const stripUnusedParams = (project: Project, code: string): string | undefined => {
  const tmp = project.createSourceFile('/__story_tmp__.tsx', `const x = ${code};`, {
    overwrite: true,
  });
  try {
    const fn = tmp.getVariableDeclarationOrThrow('x').getInitializer();
    if (!fn?.isKind(SyntaxKind.ArrowFunction) && !fn?.isKind(SyntaxKind.FunctionExpression)) {
      return undefined;
    }
    const params = fn.getParameters();
    if (params.length === 0) return fn.getText();

    const body = fn.getBody().getText();
    const bound = params.flatMap(p =>
      p.getNameNode().isKind(SyntaxKind.Identifier)
        ? [p.getName()]
        : p
            .getNameNode()
            .getDescendantsOfKind(SyntaxKind.BindingElement)
            .map(e => e.getNameNode())
            .filter(n => n.isKind(SyntaxKind.Identifier))
            .map(n => n.getText()),
    );
    if (bound.some(n => hasWord(body, n))) return fn.getText();

    const open = fn.getFirstChildByKind(SyntaxKind.OpenParenToken);
    const close = fn.getFirstChildByKind(SyntaxKind.CloseParenToken);
    const from = open ? open.getStart() : params[0].getStart();
    const to = close ? close.getEnd() : params[params.length - 1].getEnd();
    const text = fn.getText();
    const base = fn.getStart();
    return `${text.slice(0, from - base)}()${text.slice(to - base)}`;
  } finally {
    project.removeSourceFile(tmp);
  }
};

const ANNOTATION = /(?:^|\s)sb-annotation(?:-alt)?(?:\s|$)/;

/** Remove Storybook `sb-annotation` label elements that sit in a JSX children position. */
const stripAnnotations = (project: Project, code: string): string => {
  if (!code.includes('sb-annotation')) return code;
  const prefix = 'const x = ';
  const tmp = project.createSourceFile('/__story_tmp__.tsx', `${prefix}${code};`, {
    overwrite: true,
  });
  try {
    const ranges = [
      ...tmp.getDescendantsOfKind(SyntaxKind.JsxElement),
      ...tmp.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ]
      .filter(el => {
        const parent = el.getParent();
        if (!parent?.isKind(SyntaxKind.JsxElement) && !parent?.isKind(SyntaxKind.JsxFragment)) {
          return false;
        }
        const opening = el.isKind(SyntaxKind.JsxElement) ? el.getOpeningElement() : el;
        const init = opening
          .getAttribute('className')
          ?.asKind(SyntaxKind.JsxAttribute)
          ?.getInitializer();
        const value = init?.isKind(SyntaxKind.JsxExpression) ? init.getExpression() : init;
        return (
          (value?.isKind(SyntaxKind.StringLiteral) ||
            value?.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) &&
          ANNOTATION.test(value.getLiteralText())
        );
      })
      .map(el => [el.getStart() - prefix.length, el.getEnd() - prefix.length] as const)
      .sort((a, b) => b[0] - a[0]);
    if (ranges.length === 0) return code;

    let out = code;
    for (const [from, to] of ranges) out = out.slice(0, from) + out.slice(to);
    return out.replace(/\n[ \t]*(?=\n)/g, '').replace(/^[ \t]*\n/, '');
  } finally {
    project.removeSourceFile(tmp);
  }
};

/** Paste-ready source: story code without args plus a public-import header. */
export const toCopyableCode = (
  sourceFile: SourceFile,
  exportName: string,
  storyCode: string,
  srcDir: string,
): string => {
  const noSpread = storyCode.replace(/\s*\{\.\.\.args\}/g, '');
  const fn = stripUnusedParams(sourceFile.getProject(), noSpread);
  const stripped = stripAnnotations(sourceFile.getProject(), fn ?? noSpread);
  const code = fn ? `export const ${exportName} = ${stripped};` : stripped;

  const used = (name: string) => hasWord(code, name);
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

import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  Node,
  Project,
  type SourceFile,
  SyntaxKind,
  ts,
} from 'ts-morph';

export type JsxElementLike = JsxOpeningElement | JsxSelfClosingElement;

export const DS_PACKAGE = '@wallarm-org/design-system';

export function createProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { allowJs: true, jsx: ts.JsxEmit.Preserve },
  });
}

export function createTestFile(text: string, name = 'test.tsx'): SourceFile {
  return createProject().createSourceFile(name, text);
}

/** Tag names under which `component` is imported from the design system in this file. */
function localTagNames(file: SourceFile, component: string): Set<string> {
  const names = new Set<string>();
  for (const decl of file.getImportDeclarations()) {
    const spec = decl.getModuleSpecifierValue();
    if (spec !== DS_PACKAGE && spec !== `${DS_PACKAGE}/${component}`) continue;
    for (const named of decl.getNamedImports()) {
      if (named.getName() === component) {
        names.add(named.getAliasNode()?.getText() ?? component);
      }
    }
    const ns = decl.getNamespaceImport();
    if (ns && spec === DS_PACKAGE) names.add(`${ns.getText()}.${component}`);
  }
  return names;
}

export function findComponentElements(file: SourceFile, component: string): JsxElementLike[] {
  const names = localTagNames(file, component);
  if (names.size === 0) return [];
  return [
    ...file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ...file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
  ].filter(el => names.has(el.getTagNameNode().getText()));
}

export function getAttribute(el: JsxElementLike, name: string): JsxAttribute | undefined {
  const attr = el.getAttribute(name);
  return attr && Node.isJsxAttribute(attr) ? attr : undefined;
}

export function hasSpread(el: JsxElementLike): boolean {
  return el.getAttributes().some(a => Node.isJsxSpreadAttribute(a));
}

function staticLiteral(attr: JsxAttribute) {
  const init = attr.getInitializer();
  const inner = init && Node.isJsxExpression(init) ? init.getExpression() : init;
  return inner && (Node.isStringLiteral(inner) || Node.isNoSubstitutionTemplateLiteral(inner))
    ? inner
    : undefined;
}

export function readStaticString(attr: JsxAttribute): string | undefined {
  return staticLiteral(attr)?.getLiteralValue();
}

export function replaceStaticString(attr: JsxAttribute, value: string): void {
  const lit = staticLiteral(attr);
  if (!lit) return;
  const delim = lit.getText()[0];
  lit.replaceWithText(`${delim}${value}${delim}`);
}

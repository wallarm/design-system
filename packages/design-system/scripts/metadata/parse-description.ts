import path from 'path';
import { type Node, Project, type SourceFile, SyntaxKind } from 'ts-morph';
import { findStoryFiles, readMeta } from './story-source.js';

/** Evaluates string / template / `+` / `[…].join(<literal>)` forms, following identifiers. */
const evalText = (node: Node, sourceFile: SourceFile): string | undefined => {
  const n = node.isKind(SyntaxKind.ParenthesizedExpression) ? node.getExpression() : node;
  if (n.isKind(SyntaxKind.StringLiteral) || n.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
    return n.getLiteralText();
  }
  if (n.isKind(SyntaxKind.Identifier)) {
    const init = sourceFile.getVariableDeclaration(n.getText())?.getInitializer();
    return init && evalText(init, sourceFile);
  }
  if (
    n.isKind(SyntaxKind.BinaryExpression) &&
    n.getOperatorToken().getKind() === SyntaxKind.PlusToken
  ) {
    const l = evalText(n.getLeft(), sourceFile);
    const r = evalText(n.getRight(), sourceFile);
    return l !== undefined && r !== undefined ? l + r : undefined;
  }
  if (n.isKind(SyntaxKind.CallExpression)) {
    const callee = n.getExpression();
    const [sep, ...rest] = n.getArguments();
    if (!callee.isKind(SyntaxKind.PropertyAccessExpression) || callee.getName() !== 'join')
      return undefined;
    if (rest.length > 0 || !sep) return undefined;
    let arr: Node | undefined = callee.getExpression();
    if (arr.isKind(SyntaxKind.Identifier)) {
      arr = sourceFile.getVariableDeclaration(arr.getText())?.getInitializer();
    }
    const list = arr?.asKind(SyntaxKind.ArrayLiteralExpression);
    const glue = evalText(sep, sourceFile);
    if (!list || glue === undefined) return undefined;
    const parts = list.getElements().map(e => evalText(e, sourceFile));
    return parts.every(p => p !== undefined) ? parts.join(glue) : undefined;
  }
  return undefined;
};

/** `parameters.docs.description.component` of the default-exported story meta. */
export const readMetaDescription = (sourceFile: SourceFile): string | undefined => {
  let node: Node | undefined = readMeta(sourceFile);
  for (const key of ['parameters', 'docs', 'description', 'component']) {
    const prop = node?.asKind(SyntaxKind.ObjectLiteralExpression)?.getProperty(key);
    node = prop?.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
    if (!node) return undefined;
  }
  return (node && evalText(node, sourceFile)?.trim()) || undefined;
};

/** JSDoc of the variable or function named `name`; helpers in the file are ignored. */
const getNamedJsDoc = (sourceFile: SourceFile | undefined, name: string): string | undefined => {
  const decl = sourceFile?.getVariableStatement(s =>
    s.getDeclarations().some(d => d.getName() === name),
  );
  const docs = decl?.getJsDocs() ?? sourceFile?.getFunction(name)?.getJsDocs() ?? [];
  return docs.at(0)?.getDescription().trim() || undefined;
};

/** A `/** … *\/` comment opening the file — for a folder of parts with no root component (BulkBar). */
const leadingDoc = (sourceFile: SourceFile | undefined): string | undefined => {
  const comment = sourceFile?.getStatements()[0]?.getLeadingCommentRanges()[0]?.getText();
  const body = comment?.match(/^\/\*\*([\s\S]*?)\*\/$/)?.[1];
  return body?.replace(/^\s*\* ?/gm, '').trim() || undefined;
};

const storiesProject = new Project();

export const parseComponentDescription = (
  project: Project,
  componentDir: string,
  componentName: string,
): string | undefined => {
  // A family of components in one folder (SimpleCharts) has no meta of its own: a
  // sibling's story meta describes that sibling, not the family.
  const files = findStoryFiles(project, componentDir);
  const storyPath =
    files.find(file => path.basename(file) === `${componentName}.stories.tsx`) ??
    (files.length === 1 ? files[0] : undefined);
  const story =
    storyPath &&
    (project.getSourceFile(storyPath) ?? storiesProject.addSourceFileAtPathIfExists(storyPath));
  const fromMeta = story && readMetaDescription(story);
  if (fromMeta) return fromMeta;

  const get = (file: string) => project.getSourceFile(path.join(componentDir, file));
  return (
    getNamedJsDoc(get(`${componentName}.tsx`), componentName) ??
    getNamedJsDoc(get(`${componentName}Root.tsx`), componentName) ??
    leadingDoc(get('index.ts'))
  );
};

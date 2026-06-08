import path from 'path';
import type { Project } from 'ts-morph';

const getComponentDescription = (
  sourceFile: ReturnType<Project['getSourceFile']>,
): string | undefined => {
  if (!sourceFile) return undefined;

  for (const varDecl of sourceFile.getVariableStatements()) {
    const jsDocs = varDecl.getJsDocs();
    if (jsDocs.length > 0) {
      return jsDocs.at(0)?.getDescription().trim();
    }
  }

  return undefined;
};

export const parseComponentDescription = (
  project: Project,
  componentDir: string,
  componentName: string,
): string | undefined => {
  const mainFile = project.getSourceFile(path.join(componentDir, `${componentName}.tsx`));
  const rootFile = project.getSourceFile(path.join(componentDir, `${componentName}Root.tsx`));

  return getComponentDescription(mainFile) ?? getComponentDescription(rootFile);
};

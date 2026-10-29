import { Node, Project } from 'ts-morph';
import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PACKAGE_DIR } from '../config';
import { componentReadme } from './component-readme';
import { consuming } from './consuming';

const packageRoot = PACKAGE_DIR;
const excluded = new Set([
  'ThemeProvider',
  'DateFormatProvider',
  'ButtonBase',
  'Polymorphic',
  'TemporalCore',
  'Checkmark',
  'BulkBar',
  'NavPanel',
  'SimpleCharts',
]);

export interface BuildDocsOptions {
  outDir: string;
  metadataPath: string;
  notSynced: string[];
}

/** Read parameter defaults without type-checking or changing the published metadata. */
const sourceDefaults = (project: Project, componentName: string): Record<string, string> => {
  const defaults: Record<string, string> = {};
  for (const source of project.getSourceFiles()) {
    const declaration = source.getVariableDeclaration(componentName);
    const initializer = declaration?.getInitializer();
    const fn =
      initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))
        ? initializer
        : source.getFunction(componentName);
    const binding = fn?.getParameters()[0]?.getNameNode();
    if (!binding || !Node.isObjectBindingPattern(binding)) continue;
    for (const element of binding.getElements()) {
      const value = element.getInitializer();
      if (!value) continue;
      const name = element.getPropertyNameNode()?.getText() ?? element.getName();
      // Local constants such as DEFAULT_SEARCH_THRESHOLD are readable as literal defaults too.
      const resolved = Node.isIdentifier(value)
        ? (source.getVariableDeclaration(value.getText())?.getInitializer() ?? value)
        : value;
      defaults[name.replace(/^['"]|['"]$/g, '')] = Node.isStringLiteral(resolved)
        ? resolved.getLiteralText()
        : resolved.getText();
    }
  }
  return defaults;
};

export const buildDocs = async ({
  outDir,
  metadataPath,
  notSynced,
}: BuildDocsOptions): Promise<{
  components: string[];
}> => {
  const metadata: DesignSystemMetadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  const components = metadata.components
    .filter(component => !excluded.has(component.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  project.addSourceFilesAtPaths(path.join(packageRoot, 'src/components/**/*.tsx'));
  const publicNames = new Map<string, string>();
  for (const [file, namespace] of [
    ['src/index.ts', 'window.WallarmDS'],
    ['src/icons/index.ts', 'window.WallarmDS.Icons'],
  ] as const) {
    const source = project.addSourceFileAtPath(path.join(packageRoot, file));
    for (const declaration of source.getExportDeclarations()) {
      if (declaration.isTypeOnly()) continue;
      for (const named of declaration.getNamedExports()) {
        if (!named.isTypeOnly()) {
          const name = named.getAliasNode()?.getText() ?? named.getName();
          publicNames.set(
            namespace.endsWith('.Icons') ? `Icons.${name}` : name,
            `${namespace}.${name}`,
          );
        }
      }
    }
  }
  const storySources = new Map(
    project
      .getSourceFiles()
      .filter(source => source.getFilePath().endsWith('.stories.tsx'))
      .map(source => [
        path
          .relative(path.join(packageRoot, 'src/components'), source.getFilePath())
          .split(path.sep)
          .join('/'),
        source.getFullText(),
      ]),
  );

  await mkdir(path.join(outDir, 'components'), { recursive: true });
  for (const component of components) {
    const componentDir = path.join(outDir, 'components', component.name);
    await mkdir(componentDir, { recursive: true });
    const defaults = Object.fromEntries(
      [component.name, ...component.subComponents.map(part => part.name)].map(name => [
        name,
        sourceDefaults(project, name),
      ]),
    );
    const readme = componentReadme(component, defaults, storySources, publicNames);
    if (Buffer.byteLength(readme) > 64_000)
      throw new Error(`${component.name} README exceeds 64,000 bytes.`);
    await writeFile(path.join(componentDir, 'README.md'), readme);
  }

  const distDir = path.join(packageRoot, 'dist');
  const typePaths = (await readdir(distDir, { recursive: true }))
    .filter(file => file.endsWith('.d.ts'))
    .sort();
  if (typePaths.length === 0)
    throw new Error('No declarations in dist; run the normal package build first.');
  const declarations = (
    await Promise.all(
      typePaths.map(
        async file =>
          `// ${file.split(path.sep).join('/')}\n${await readFile(path.join(distDir, file), 'utf8')}`,
      ),
    )
  ).join('\n');
  if (Buffer.byteLength(declarations) > 1_500_000) {
    throw new Error(
      `Declaration documentation exceeds 1,500,000 bytes: ${Buffer.byteLength(declarations)}`,
    );
  }
  await writeFile(path.join(outDir, 'components/index.d.ts'), declarations);

  const brandBook = await readFile(new URL('./readme-root.md', import.meta.url), 'utf8');
  const omissions = [...new Set(notSynced)]
    .sort()
    .map(note => `- ${note}`)
    .join('\n');
  const readme =
    `${brandBook.trim()}\n\n${consuming}\n\n## Not synced\n\n` +
    'This is the separate Claude Design build; the npm package still targets React 19.\n\n' +
    '- Tour needs a hook-driven controller and is not directly mountable via x-import. Toast uses the lifecycle recipe in its guide.\n' +
    '- ThemeProvider and DateFormatProvider and internal primitives have no component cards. Root scopes the canvas theme and overlays.\n' +
    '- Story examples with unresolved dependencies are not rewritten into incomplete canvas markup; their source paths and live previews remain the reference.\n' +
    (omissions ? `${omissions}\n` : '') +
    '\nGenerated component guides and types are derived from repository source and build metadata. Change them in wallarm/design-system and run /claude-design-sync there.\n';
  await writeFile(path.join(outDir, 'README.md'), readme);
  return { components: components.map(component => component.name) };
};

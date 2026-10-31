import { Node, Project, type SourceFile } from 'ts-morph';
import type { DesignSystemMetadata, ExampleMetadata } from '@wallarm-org/mcp-core';
import { existsSync, statSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readMetaDescription } from '../../scripts/metadata/parse-description';
import { CLAUDE_DESIGN, PACKAGE_DIR } from '../config';
import { componentReadme } from './component-readme';
import { consuming } from './consuming';
import { README_CAP_BYTES, storyGuide } from './story-guide';

const packageRoot = PACKAGE_DIR;
const componentsDir = path.join(packageRoot, 'src/components');
const fromComponents = (file: string): string =>
  path.relative(componentsDir, file).split(path.sep).join('/');

const resolveImport = (from: string, specifier: string): string => {
  const base = path.resolve(path.dirname(from), specifier);
  const file = [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find(
    candidate => existsSync(candidate) && statSync(candidate).isFile(),
  );
  if (!file) throw new Error(`${fromComponents(from)}: cannot resolve ${specifier}`);
  return file;
};

/**
 * Story files plus every relative import that brings in at least one non-public value name,
 * recursively, deduplicated by path. Public names are already reachable as `WallarmDS.*`.
 */
const storyModules = (
  project: Project,
  storyFiles: string[],
  publicNames: ReadonlySet<string>,
): { path: string; text: string }[] => {
  const files = storyFiles.map(file => path.join(componentsDir, file));
  const sources: SourceFile[] = [];
  for (let i = 0; i < files.length; i++) {
    const source = project.addSourceFileAtPath(files[i]!);
    sources.push(source);
    const dependencies = [
      ...source.getImportDeclarations().map(declaration => ({
        specifier: declaration.getModuleSpecifierValue(),
        typeOnly: declaration.isTypeOnly(),
        names: [
          ...(declaration.getDefaultImport() ? ['default'] : []),
          ...(declaration.getNamespaceImport() ? ['*'] : []),
          ...declaration
            .getNamedImports()
            .filter(named => !named.isTypeOnly())
            .map(named => named.getName()),
        ],
      })),
      // Re-export barrels: their targets ship by the same rule; `export *` always ships.
      ...source.getExportDeclarations().map(declaration => ({
        specifier: declaration.getModuleSpecifierValue() ?? '',
        typeOnly: declaration.isTypeOnly(),
        names: declaration.hasNamedExports()
          ? declaration
              .getNamedExports()
              .filter(named => !named.isTypeOnly())
              .map(named => named.getAliasNode()?.getText() ?? named.getName())
          : ['*'],
      })),
    ];
    for (const { specifier, typeOnly, names } of dependencies) {
      if (!specifier.startsWith('.') || typeOnly) continue;
      if (names.every(name => publicNames.has(name))) continue;
      const file = resolveImport(source.getFilePath(), specifier);
      if (!files.includes(file)) files.push(file);
    }
  }
  return sources.map(source => ({
    path: fromComponents(source.getFilePath()),
    text: source.getFullText(),
  }));
};

/** Throws unless a guide emitted exactly one heading per Storybook story. */
export const assertStoriesShipped = (
  guide: string,
  stories: ExampleMetadata[],
  headings: string[],
): void => {
  const sorted = (names: string[]) => [...names].sort().join('\n');
  if (sorted(headings) !== sorted(stories.map(story => story.name)))
    throw new Error(`${guide}: guide stories do not match its Storybook stories.`);
};

/** Story files outside src/components that have no component guide, by src-relative prefix. */
const NON_COMPONENT_STORIES: Record<string, string> = {
  'theme/': 'theme gallery story, not a component; see tokens.css',
  'icons/': 'icon gallery story, not a component; see assets/Icons',
};

interface Guide {
  name: string;
  description?: string;
  reference: string;
  stories: ExampleMetadata[];
}

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
  notSynced: string[];
}> => {
  const metadata: DesignSystemMetadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  project.addSourceFilesAtPaths(path.join(packageRoot, 'src/components/**/*.tsx'));
  // Names reachable as `WallarmDS.*`: the root barrel, icons and component subpaths, as in the bundle.
  const publicNames = new Set<string>();
  for (const source of [
    project.addSourceFileAtPath(path.join(packageRoot, 'src/index.ts')),
    project.addSourceFileAtPath(path.join(packageRoot, 'src/icons/index.ts')),
    ...project.addSourceFilesAtPaths(path.join(componentsDir, '*/index.ts')),
  ]) {
    for (const declaration of source.getExportDeclarations()) {
      if (declaration.isTypeOnly()) continue;
      for (const named of declaration.getNamedExports())
        if (!named.isTypeOnly())
          publicNames.add(named.getAliasNode()?.getText() ?? named.getName());
    }
  }

  const reference = (part: Parameters<typeof componentReadme>[0]): string =>
    componentReadme(
      part,
      Object.fromEntries(
        [part.name, ...part.subComponents.map(sub => sub.name)].map(name => [
          name,
          sourceDefaults(project, name),
        ]),
      ),
    );
  const guides: Guide[] = [];
  const omitted: string[] = [];
  for (const component of metadata.components) {
    if (CLAUDE_DESIGN.internal.has(component.name)) {
      omitted.push(`${component.name}: internal primitive; no guide.`);
    } else if (CLAUDE_DESIGN.splitByStoryFile.has(component.name)) {
      const byFile = new Map<string, ExampleMetadata[]>();
      for (const example of component.examples) {
        const file = example.storyFile ?? '';
        byFile.set(file, [...(byFile.get(file) ?? []), example]);
      }
      for (const [storyFile, stories] of byFile) {
        const name = path.basename(storyFile, '.stories.tsx');
        const part = component.subComponents.find(sub => sub.name === name);
        guides.push({
          name,
          description: readMetaDescription(
            project.getSourceFileOrThrow(path.join(componentsDir, storyFile)),
          ),
          reference: part
            ? reference({ name, props: part.props, variants: [], subComponents: [] })
            : '',
          stories,
        });
      }
    } else {
      if (!component.examples.length)
        omitted.push(`${component.name}: no Storybook story; props only.`);
      guides.push({
        name: component.name,
        description: component.description,
        reference: reference(component),
        stories: component.examples,
      });
    }
  }
  guides.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  // Every story file under src/ ships in a guide or is listed with a reason.
  const guided = new Set(
    guides.flatMap(guide => guide.stories.map(story => `components/${story.storyFile}`)),
  );
  for (const file of (await readdir(path.join(packageRoot, 'src'), { recursive: true }))
    .map(file => file.split(path.sep).join('/'))
    .filter(file => file.endsWith('.stories.tsx') && !guided.has(file))
    .sort()) {
    const reason = Object.entries(NON_COMPONENT_STORIES).find(([prefix]) =>
      file.startsWith(prefix),
    )?.[1];
    if (!reason) throw new Error(`src/${file}: story file is in no guide.`);
    omitted.push(`src/${file}: ${reason}.`);
  }
  const duplicate = guides.find((guide, i) => guides[i + 1]?.name === guide.name);
  if (duplicate) throw new Error(`Two guides are named ${duplicate.name}.`);

  // Story files and fixture modules ship verbatim; a separate project keeps them out of
  // sourceDefaults' scan.
  const modulesProject = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });
  await mkdir(path.join(outDir, 'components'), { recursive: true });
  for (const guide of guides) {
    const componentDir = path.join(outDir, 'components', guide.name);
    await mkdir(componentDir, { recursive: true });
    const storyFiles = [...new Set(guide.stories.map(story => story.storyFile ?? ''))];
    const { readme, overflow, headings } = storyGuide({
      ...guide,
      modules: storyModules(modulesProject, storyFiles, publicNames),
    });
    if (Buffer.byteLength(readme) > README_CAP_BYTES)
      throw new Error(`${guide.name} README exceeds ${README_CAP_BYTES} bytes.`);
    assertStoriesShipped(guide.name, guide.stories, headings);
    await writeFile(path.join(componentDir, 'README.md'), readme);
    if (overflow) await writeFile(path.join(componentDir, 'stories.md'), overflow);
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
  const omissions = [...new Set([...notSynced, ...omitted])].sort();
  const readme =
    `${brandBook.trim()}\n\n${consuming}\n\n## Not synced\n\n` +
    'This is the separate Claude Design build; the npm package still targets React 19.\n\n' +
    omissions.map(note => `- ${note}\n`).join('') +
    '\nGenerated component guides and types are derived from repository source and build metadata. Change them in wallarm/design-system and run /claude-design-sync there.\n';
  await writeFile(path.join(outDir, 'README.md'), readme);
  return { components: guides.map(guide => guide.name), notSynced: omissions };
};

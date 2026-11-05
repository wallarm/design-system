import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';
import type { ComponentMetadata, DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { designSystemMetadataSchema } from '@wallarm-org/mcp-core';
import { collectPublicApi, INTERNAL_COMPONENTS } from './internal.js';
import { parseComponentDescription } from './parse-description.js';
import { parseComponentDocs } from './parse-docs.js';
import { parseExamples } from './parse-examples.js';
import { parseGuidelines, resolveStoryRefs } from './parse-guidelines.js';
import { parseComponentProps } from './parse-props.js';
import { parseTokens } from './parse-tokens.js';
import { parseVariantsForComponent } from './parse-variants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const main = () => {
  console.log('Generating design system metadata...');

  const tsconfigPath = path.join(ROOT, 'tsconfig.app.json');
  const project = new Project({ tsConfigFilePath: tsconfigPath });

  // Scan components directory
  const componentsDir = path.join(ROOT, 'src/components');
  const componentDirs = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !INTERNAL_COMPONENTS.has(dirent.name))
    .map(dirent => dirent.name);

  console.log(`Found ${componentDirs.length} component directories`);

  const components: ComponentMetadata[] = [];

  for (const name of componentDirs) {
    const componentDir = path.join(componentsDir, name);
    const importPath = `@wallarm-org/design-system/${name}`;

    // Parse props
    const { mainProps, subComponents } = parseComponentProps(project, componentDir, name);

    // Parse variants
    const variants = parseVariantsForComponent(project, componentDir, name);

    // Parse usage examples from stories
    const examples = parseExamples(project, componentDir, name);

    const description = parseComponentDescription(project, componentDir, name);

    const docs = parseComponentDocs(componentDir);

    components.push({
      name,
      ...(description && { description }),
      importPath,
      props: mainProps,
      variants,
      subComponents: subComponents.map(sc => ({
        name: sc.name,
        props: sc.props,
      })),
      examples,
      ...(docs.length > 0 && { docs }),
    });
  }

  // Parse CSS tokens
  const themeDir = path.join(ROOT, 'src/theme');
  const tokens = parseTokens({ themeDir });

  // Read version from package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  const version = packageJson.version;

  const metadata: DesignSystemMetadata = {
    version,
    generatedAt: new Date().toISOString(),
    components,
    tokens,
  };

  // Validate with Zod
  const result = designSystemMetadataSchema.safeParse(metadata);
  if (!result.success) {
    console.error('Metadata validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }

  // Write output
  const outDir = path.join(ROOT, 'dist/metadata');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'components.json');
  fs.writeFileSync(outPath, JSON.stringify(metadata, null, 2));

  console.log(`Metadata written to ${outPath}`);
  console.log(`  Components: ${components.length}`);
  console.log(`  Token categories: ${tokens.length}`);
  console.log(`  Total tokens: ${tokens.reduce((sum, cat) => sum + cat.tokens.length, 0)}`);

  // Guidelines: validate, emit guidelines.json, and ship the raw markdown
  const guidelinesDir = path.join(ROOT, 'src', 'guidelines');
  // Public API: root exports plus every `@wallarm-org/design-system/<Component>` subpath, minus internals
  const api = collectPublicApi(project, path.join(ROOT, 'src'));
  let guidelines: ReturnType<typeof parseGuidelines>;
  try {
    guidelines = parseGuidelines({ dir: guidelinesDir, version, api });
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
  const guidelinesPath = path.join(outDir, 'guidelines.json');
  fs.writeFileSync(guidelinesPath, JSON.stringify(guidelines, null, 2));
  fs.rmSync(path.join(ROOT, 'dist/guidelines'), { recursive: true, force: true });
  // Markdown only: pattern stories, their E2E tests and screenshots stay in the repo.
  fs.cpSync(guidelinesDir, path.join(ROOT, 'dist/guidelines'), {
    recursive: true,
    filter: src =>
      (fs.statSync(src).isDirectory() && !src.endsWith('-snapshots')) || src.endsWith('.md'),
  });
  // ```story refs ship as the story's code, as in guidelines.json.
  for (const g of guidelines.guidelines) {
    if (!g.stories) continue;
    const file = `${g.slug}.md`;
    const source = fs.readFileSync(path.join(guidelinesDir, file), 'utf-8');
    fs.writeFileSync(path.join(ROOT, 'dist/guidelines', file), resolveStoryRefs(source, g.stories));
  }

  console.log(`Guidelines written to ${guidelinesPath}`);
  console.log(
    `  Guidelines: ${guidelines.guidelines.length}, pattern stories: ${guidelines.guidelines.reduce((n, g) => n + (g.stories?.length ?? 0), 0)}`,
  );
};

main();

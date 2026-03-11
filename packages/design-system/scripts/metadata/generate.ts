import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';
import type { ComponentMetadata, DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { designSystemMetadataSchema } from '@wallarm-org/mcp-core';
import { parseExamples } from './parse-examples.js';
import { parseComponentProps } from './parse-props.js';
import { parseTokens } from './parse-tokens.js';
import { parseVariantsForComponent } from './parse-variants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const getComponentDescription = (
  sourceFile: ReturnType<Project['getSourceFile']>,
): string | undefined => {
  if (!sourceFile) return undefined;

  // Look for JSDoc on the main exported component
  for (const varDecl of sourceFile.getVariableStatements()) {
    const jsDocs = varDecl.getJsDocs();
    if (jsDocs.length > 0) {
      return jsDocs.at(0)?.getDescription().trim();
    }
  }
  return undefined;
};

const main = () => {
  console.log('Generating design system metadata...');

  const tsconfigPath = path.join(ROOT, 'tsconfig.app.json');
  const project = new Project({ tsConfigFilePath: tsconfigPath });

  // Scan components directory (same pattern as generate-exports.ts)
  const componentsDir = path.join(ROOT, 'src/components');
  const componentDirs = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
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

    // Get description from JSDoc on the main component file
    const mainFile = project.getSourceFile(path.join(componentDir, `${name}.tsx`));
    const description = getComponentDescription(mainFile);

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
};

main();

import path from 'path';
import { type Node, Project, type SourceFile, SyntaxKind } from 'ts-morph';
import type { ExampleMetadata } from '@wallarm-org/mcp-core';
import { findStoryFiles, readStoryTitle, toCopyableCode } from './story-source.js';

// Stories are read syntactically, so they get their own type-checker-free project:
// adding them to the caller's tsconfig project invalidates its program, and the
// next type query (parseComponentProps) rebuilds it — ~1s per component.
const storiesProject = new Project();

/**
 * Parse usage examples from Storybook stories.
 *
 * Strategy:
 * 1. Find every *.stories.tsx under the component directory ({Name}.stories.tsx first)
 * 2. For each named export (excluding default):
 *    - StoryFn: extract the initializer (arrow/function expression) text
 *    - StoryObj: reconstruct minimal JSX from args
 *    - `Template.bind({})`: the bound template's function text
 * 3. Extract descriptions from JSDoc or .parameters assignments
 */
export const parseExamples = (
  project: Project,
  componentDir: string,
  componentName: string,
): ExampleMetadata[] => {
  const dir = path.resolve(componentDir);
  const componentsRoot = path.dirname(dir);
  const srcDir = path.dirname(componentsRoot);

  return findStoryFiles(project, dir).flatMap(storiesPath => {
    const sourceFile =
      project.getSourceFile(storiesPath) ?? storiesProject.addSourceFileAtPathIfExists(storiesPath);
    if (!sourceFile) return [];
    const storyFile = path.relative(componentsRoot, storiesPath).split(path.sep).join('/');
    return parseStoryFile(sourceFile, { componentName, storyFile, srcDir });
  });
};

/**
 * Every named story export of one stories file, as paste-ready examples. Shared by component
 * examples and pattern guideline stories, so both get the same extraction.
 */
export const parseStoryFile = (
  sourceFile: SourceFile,
  {
    componentName,
    storyFile,
    srcDir,
  }: {
    /** Tag used when a StoryObj has to be rebuilt from its args. */
    componentName: string;
    /** `storyFile` of each example, e.g. `Button/Button.stories.tsx`. */
    storyFile: string;
    /** The package `src/`, to map relative imports to public ones. */
    srcDir: string;
  },
): ExampleMetadata[] => {
  const examples: ExampleMetadata[] = [];
  const descriptions = collectDescriptions(sourceFile);
  const assignedTags = collectAssignedTags(sourceFile);
  const storyTitle = readStoryTitle(sourceFile);

  for (const varStatement of sourceFile.getVariableStatements()) {
    if (!varStatement.hasExportKeyword()) continue;

    for (const decl of varStatement.getDeclarations()) {
      const name = decl.getName();
      // Skip default meta export (handled as `export default meta` usually, but just in case)
      if (name === 'meta' || name === 'default') continue;

      const initializer = decl.getInitializer();
      if (!initializer) continue;

      const kind = initializer.getKind();
      let code: string;

      if (kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.FunctionExpression) {
        // StoryFn pattern — extract the function source
        code = initializer.getText();
      } else if (kind === SyntaxKind.ObjectLiteralExpression) {
        // StoryObj pattern — keep the render body; reconstruct JSX from args otherwise
        const render = initializer
          .getProperty('render')
          ?.asKind(SyntaxKind.PropertyAssignment)
          ?.getInitializer();
        code =
          render?.isKind(SyntaxKind.ArrowFunction) || render?.isKind(SyntaxKind.FunctionExpression)
            ? render.getText()
            : reconstructJsxFromStoryObj(initializer.getText(), componentName);
      } else {
        // `Template.bind({})` — the bound template's function source, as for StoryFn
        const template = boundTemplate(sourceFile, initializer);
        if (!template) continue;
        code = template.getText();
      }

      const example: ExampleMetadata = {
        name,
        code: toCopyableCode(sourceFile, name, code, srcDir),
        storyFile,
      };
      if (storyTitle) example.storyTitle = storyTitle;

      const tags =
        assignedTags.get(name) ??
        (initializer.isKind(SyntaxKind.ObjectLiteralExpression)
          ? readStringArray(
              initializer
                .getProperty('tags')
                ?.asKind(SyntaxKind.PropertyAssignment)
                ?.getInitializer(),
            )
          : undefined);
      if (tags) example.tags = tags;

      const description = descriptions.get(name);
      if (description) {
        example.description = description;
      }

      examples.push(example);
    }
  }

  return examples;
};

/** The arrow/function initializer of `X` in `X.bind(...)`, if `X` is a local variable. */
const boundTemplate = (sourceFile: SourceFile, node: Node): Node | undefined => {
  const callee = node.asKind(SyntaxKind.CallExpression)?.getExpression();
  const access = callee?.asKind(SyntaxKind.PropertyAccessExpression);
  if (access?.getName() !== 'bind') return undefined;
  const target = access.getExpression().asKind(SyntaxKind.Identifier);
  const init = target && sourceFile.getVariableDeclaration(target.getText())?.getInitializer();
  return init?.isKind(SyntaxKind.ArrowFunction) || init?.isKind(SyntaxKind.FunctionExpression)
    ? init
    : undefined;
};

/** `['a', 'b']` → `['a', 'b']`; undefined unless every element is a string literal. */
const readStringArray = (node: Node | undefined): string[] | undefined => {
  if (!node?.isKind(SyntaxKind.ArrayLiteralExpression)) return undefined;
  const out: string[] = [];
  for (const el of node.getElements()) {
    if (
      !el.isKind(SyntaxKind.StringLiteral) &&
      !el.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
    ) {
      return undefined;
    }
    out.push(el.getLiteralText());
  }
  return out;
};

/** Post-export `Story.tags = ['!autodocs']` assignments. */
const collectAssignedTags = (sourceFile: SourceFile): Map<string, string[]> => {
  const tags = new Map<string, string[]>();
  for (const statement of sourceFile.getStatements()) {
    const expr = statement.asKind(SyntaxKind.ExpressionStatement)?.getExpression();
    const binary = expr?.asKind(SyntaxKind.BinaryExpression);
    if (binary?.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) continue;
    const left = binary.getLeft().asKind(SyntaxKind.PropertyAccessExpression);
    if (left?.getName() !== 'tags') continue;
    const value = readStringArray(binary.getRight());
    if (value) tags.set(left.getExpression().getText(), value);
  }
  return tags;
};

/**
 * Collect descriptions from two sources:
 * 1. JSDoc on VariableStatement: `/** Basic uncontrolled dialog *​/`
 * 2. Post-export: `StoryName.parameters = { docs: { description: { story: '...' } } }`
 */
const collectDescriptions = (sourceFile: SourceFile): Map<string, string> => {
  const descriptions = new Map<string, string>();

  // Source 1: JSDoc comments on variable statements
  for (const varStatement of sourceFile.getVariableStatements()) {
    if (!varStatement.hasExportKeyword()) continue;
    const jsDocs = varStatement.getJsDocs();
    if (jsDocs.length > 0) {
      const doc = jsDocs.at(0);
      const desc = doc?.getDescription().trim();

      if (desc) {
        for (const decl of varStatement.getDeclarations()) {
          descriptions.set(decl.getName(), desc);
        }
      }
    }
  }

  // Source 2: Post-export parameter assignments
  // e.g., `WithFooterLeftActions.parameters = { docs: { description: { story: '...' } } }`
  for (const statement of sourceFile.getStatements()) {
    if (statement.getKind() !== SyntaxKind.ExpressionStatement) continue;

    const text = statement.getText();
    const match = text.match(
      /^(\w+)\.parameters\s*=\s*\{[\s\S]*?docs:\s*\{[\s\S]*?description:\s*\{[\s\S]*?story:\s*['"`]([\s\S]*?)['"`]/,
    );
    if (match) {
      const [, storyName, description] = match;
      // Only set if not already set by JSDoc (JSDoc takes priority)
      if (storyName && description && !descriptions.has(storyName)) {
        descriptions.set(storyName, description.trim());
      }
    }
  }

  return descriptions;
};

/**
 * Reconstruct minimal JSX from a StoryObj literal.
 *
 * For `{ args: { disabled: true } }` → `<ComponentName disabled />`
 * For `{ args: { value: 'Some value...' } }` → `<ComponentName value="Some value..." />`
 * For `{}` (no args or only non-prop args) → `<ComponentName />`
 */
const reconstructJsxFromStoryObj = (objText: string, componentName: string): string => {
  // Extract the args object content
  const argsMatch = objText.match(/args:\s*\{([^}]*)\}/);
  if (!argsMatch) return `<${componentName} />`;

  const argsContent = argsMatch[1]?.trim();
  if (!argsContent) return `<${componentName} />`;

  // Parse individual args — handle simple key: value pairs
  const props: string[] = [];
  const argPairs = argsContent
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  for (const pair of argPairs) {
    const kvMatch = pair.match(/^(\w+):\s*(.+)$/);
    if (!kvMatch) continue;

    const [, key, value] = kvMatch;
    // Skip Storybook-internal args (onChange, onClick, etc.)
    if (key === 'onChange' || key === 'onClick') continue;

    const trimmed = value?.trim();

    if (trimmed && key) {
      if (trimmed === 'true') {
        props.push(key);
      } else if (trimmed === 'false') {
        props.push(`${key}={false}`);
      } else if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
        // String value — normalize to double quotes
        const unquoted = trimmed.slice(1, -1);
        props.push(`${key}="${unquoted}"`);
      } else {
        props.push(`${key}={${trimmed}}`);
      }
    }
  }

  if (props.length === 0) return `<${componentName} />`;
  return `<${componentName} ${props.join(' ')} />`;
};

/** Stories of a pattern guideline (`src/guidelines/patterns/<slug>.stories.tsx`), in file order. */
export const parsePatternStories = (storiesPath: string, srcDir: string): ExampleMetadata[] => {
  const sourceFile = storiesProject.addSourceFileAtPathIfExists(storiesPath);
  if (!sourceFile) return [];
  const storyFile = path.relative(srcDir, storiesPath).split(path.sep).join('/');
  return parseStoryFile(sourceFile, { componentName: 'Story', storyFile, srcDir });
};

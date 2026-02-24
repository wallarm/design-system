import path from 'path';
import { type Project, type SourceFile, SyntaxKind } from 'ts-morph';
import type { ExampleMetadata } from '@wallarm-org/mcp-core';

/**
 * Parse usage examples from Storybook stories.
 *
 * Strategy:
 * 1. Find {Name}.stories.tsx in the component directory
 * 2. For each named export (excluding default):
 *    - StoryFn: extract the initializer (arrow/function expression) text
 *    - StoryObj: reconstruct minimal JSX from args
 * 3. Extract descriptions from JSDoc or .parameters assignments
 */
export const parseExamples = (
  project: Project,
  componentDir: string,
  componentName: string,
): ExampleMetadata[] => {
  const storiesPath = path.join(componentDir, `${componentName}.stories.tsx`);
  const sourceFile = project.addSourceFileAtPathIfExists(storiesPath);
  if (!sourceFile) return [];

  const descriptions = collectDescriptions(sourceFile);
  const examples: ExampleMetadata[] = [];

  for (const varStatement of sourceFile.getVariableStatements()) {
    if (!varStatement.isExported()) continue;

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
        // StoryObj pattern — reconstruct JSX from args
        code = reconstructJsxFromStoryObj(initializer.getText(), componentName);
      } else {
        continue;
      }

      const example: ExampleMetadata = { name, code };

      const description = descriptions.get(name);
      if (description) {
        example.description = description;
      }

      examples.push(example);
    }
  }

  return examples;
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
    if (!varStatement.isExported()) continue;
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

import { type Project, type SourceFile, SyntaxKind, type Type } from 'ts-morph';
import type { PropMetadata } from '@wallarm-org/mcp-core';

/**
 * Parse component props from TypeScript types using ts-morph.
 *
 * Strategy:
 * 1. Load the component's barrel index.ts
 * 2. Find all exported type aliases matching *Props pattern
 * 3. For each Props type, resolve all properties via Type.getProperties()
 * 4. Extract default values from the component function's destructuring pattern
 */

// Props to skip — inherited from HTMLElement or React internal
const SKIP_PROPS = new Set([
  'key',
  'ref',
  'children',
  'className',
  'style',
  'dangerouslySetInnerHTML',
]);

// HTML attribute props we still want to show if they're explicitly declared
const HTML_ATTR_PREFIXES = ['on', 'aria-', 'data-'];

function isInheritedHtmlProp(name: string): boolean {
  if (SKIP_PROPS.has(name)) return false; // Let SKIP_PROPS take priority
  return HTML_ATTR_PREFIXES.some(p => name.startsWith(p));
}

function getTypeText(type: Type): string {
  const text = type.getText();

  // Simplify overly verbose types
  if (text.length > 200) {
    if (type.isUnion()) {
      const types = type.getUnionTypes().map(t => t.getText());
      if (types.every(t => t.startsWith('"') || t === 'undefined')) {
        return types.filter(t => t !== 'undefined').join(' | ');
      }
    }
    return 'complex';
  }

  // Clean up import references
  return text.replace(/import\("[^"]+"\)\./g, '').replace(/React\./g, '');
}

function extractDefaultValues(
  sourceFile: SourceFile,
  componentName: string,
): Record<string, string> {
  const defaults: Record<string, string> = {};

  // Find the component function declaration or arrow function
  for (const varDecl of sourceFile.getVariableDeclarations()) {
    if (varDecl.getName() !== componentName) continue;

    const init = varDecl.getInitializer();
    if (!init) continue;

    // Arrow function: const Button: FC<...> = ({ variant = 'primary', ... }) => { ... }
    let params: ReturnType<typeof init.getDescendantsOfKind>;
    if (init.isKind(SyntaxKind.ArrowFunction) || init.isKind(SyntaxKind.FunctionExpression)) {
      params = init.getDescendantsOfKind(SyntaxKind.BindingElement);
    } else {
      continue;
    }

    for (const param of params) {
      const paramInit = param.getInitializer();
      if (paramInit) {
        const name = param.getName();
        const value = paramInit.getText().replace(/^['"]|['"]$/g, '');
        defaults[name] = value;
      }
    }
  }

  return defaults;
}

export function parsePropsFromType(
  propsType: Type,
  defaults: Record<string, string>,
): PropMetadata[] {
  const props: PropMetadata[] = [];

  for (const prop of propsType.getProperties()) {
    const name = prop.getName();

    // Skip internal/inherited HTML props
    if (SKIP_PROPS.has(name)) continue;
    if (isInheritedHtmlProp(name)) continue;

    const declarations = prop.getDeclarations();
    const declaration = declarations[0];

    // Get type from the symbol's value declaration
    let propType: Type;
    if (declaration && 'getType' in declaration) {
      propType = (declaration as { getType(): Type }).getType();
    } else {
      continue;
    }

    // Get JSDoc description
    let description: string | undefined;
    if (declaration && 'getJsDocs' in declaration) {
      const jsDocs = (
        declaration as { getJsDocs(): Array<{ getDescription(): string }> }
      ).getJsDocs();
      if (jsDocs.length > 0) {
        description = jsDocs?.at(0)?.getDescription().trim();
      }
    }
    // Also check for leading comment-based descriptions (/** ... */ before prop in interface)
    if (!description && declaration) {
      const leadingComments = declaration.getLeadingCommentRanges();
      for (const comment of leadingComments) {
        const text = comment.getText();
        const match = text.match(/\/\*\*\s*(.+?)\s*\*\//s);
        if (match?.[1]) {
          description = match[1].replace(/^\s*\*\s*/gm, '').trim();
        }
      }
    }

    const required = !prop.isOptional();
    const typeText = getTypeText(propType);
    const defaultValue = defaults[name];

    props.push({
      name,
      type: typeText,
      required,
      ...(description && { description }),
      ...(defaultValue !== undefined && { defaultValue }),
    });
  }

  return props;
}

export function parseComponentProps(
  project: Project,
  componentDir: string,
  componentName: string,
): { mainProps: PropMetadata[]; subComponents: Array<{ name: string; props: PropMetadata[] }> } {
  const indexFile = project.getSourceFile(`${componentDir}/index.ts`);
  if (!indexFile) {
    return { mainProps: [], subComponents: [] };
  }

  const mainProps: PropMetadata[] = [];
  const subComponents: Array<{ name: string; props: PropMetadata[] }> = [];

  // Find the main component file for default values
  const mainFile = project.getSourceFile(`${componentDir}/${componentName}.tsx`);
  const mainDefaults = mainFile ? extractDefaultValues(mainFile, componentName) : {};

  // Iterate over exported types from index.ts
  for (const exportDecl of indexFile.getExportDeclarations()) {
    for (const namedExport of exportDecl.getNamedExports()) {
      const name = namedExport.getName();
      if (!name.endsWith('Props')) continue;

      // Resolve the type
      const sym = namedExport.getNameNode().getSymbol();
      if (!sym) continue;

      const aliasedSym = sym.getAliasedSymbol();
      const targetSym = aliasedSym ?? sym;
      const declarations = targetSym.getDeclarations();
      if (declarations.length === 0) continue;

      const decl = declarations[0];
      let type: Type;
      if (decl && 'getType' in decl) {
        type = (decl as { getType(): Type }).getType();
      } else {
        continue;
      }

      // Determine if this is the main component's props or a sub-component's
      const expectedMainPropsName = `${componentName}Props`;
      const isMain = name === expectedMainPropsName;

      if (isMain) {
        mainProps.push(...parsePropsFromType(type, mainDefaults));
      } else {
        // Sub-component: e.g., AlertCloseProps → AlertClose
        const subName = name.replace(/Props$/, '');
        const subFile = project.getSourceFile(`${componentDir}/${subName}.tsx`);
        const subDefaults = subFile ? extractDefaultValues(subFile, subName) : {};
        subComponents.push({
          name: subName,
          props: parsePropsFromType(type, subDefaults),
        });
      }
    }
  }

  return { mainProps, subComponents };
}

import type { CallExpression, ObjectLiteralExpression, Project, SourceFile } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import type { VariantMetadata } from '@wallarm-org/mcp-core';

/**
 * Parse CVA variants from component files using ts-morph AST.
 *
 * Supports two cva() call patterns:
 * 1. cva('base-classes', { variants: ... })  — string as first arg
 * 2. cva(['base', 'classes'], { variants: ... })  — array as first arg
 *
 * For dynamic variants like Badge's `Object.values().reduce()`,
 * we gracefully degrade by noting the variant exists but can't extract options.
 */

function findCvaCallsInFile(sourceFile: SourceFile): CallExpression[] {
  const calls: CallExpression[] = [];
  sourceFile.forEachDescendant(node => {
    if (node.isKind(SyntaxKind.CallExpression)) {
      const expr = node.getExpression();
      if (expr.getText() === 'cva') {
        calls.push(node);
      }
    }
  });
  return calls;
}

function extractVariantsFromConfig(configObj: ObjectLiteralExpression): VariantMetadata[] {
  const results: VariantMetadata[] = [];
  const variantsProp = configObj.getProperty('variants');
  if (!variantsProp || !variantsProp.isKind(SyntaxKind.PropertyAssignment)) return results;

  const variantsInit = variantsProp.getInitializer();
  if (!variantsInit || !variantsInit.isKind(SyntaxKind.ObjectLiteralExpression)) return results;

  for (const prop of variantsInit.getProperties()) {
    if (!prop.isKind(SyntaxKind.PropertyAssignment)) continue;

    const variantName = prop.getName();
    const init = prop.getInitializer();

    if (init && init.isKind(SyntaxKind.ObjectLiteralExpression)) {
      // Static object: { small: '...', medium: '...', large: '...' }
      const options = init
        .getProperties()
        .filter(p => p.isKind(SyntaxKind.PropertyAssignment))
        .map(p => {
          const name = p.isKind(SyntaxKind.PropertyAssignment) ? p.getName() : '';
          // Remove quotes from property names like 'text-color'
          return name.replace(/^['"]|['"]$/g, '');
        })
        .filter(Boolean);
      results.push({ name: variantName, options });
    } else {
      // Dynamic variant (e.g., Object.values().reduce()) — record variant name with empty options
      results.push({ name: variantName, options: [] });
    }
  }

  return results;
}

function extractDefaultVariants(configObj: ObjectLiteralExpression): Record<string, string> {
  const defaults: Record<string, string> = {};
  const defaultsProp = configObj.getProperty('defaultVariants');
  if (!defaultsProp || !defaultsProp.isKind(SyntaxKind.PropertyAssignment)) return defaults;

  const init = defaultsProp.getInitializer();
  if (!init || !init.isKind(SyntaxKind.ObjectLiteralExpression)) return defaults;

  for (const prop of init.getProperties()) {
    if (!prop.isKind(SyntaxKind.PropertyAssignment)) continue;
    const value = prop
      .getInitializer()
      ?.getText()
      .replace(/^['"]|['"]$/g, '');
    if (value) {
      defaults[prop.getName()] = value;
    }
  }

  return defaults;
}

export function parseVariantsFromFile(sourceFile: SourceFile): VariantMetadata[] {
  const cvaCalls = findCvaCallsInFile(sourceFile);
  const allVariants: VariantMetadata[] = [];

  for (const call of cvaCalls) {
    const args = call.getArguments();
    // Config object is the last argument that is an object literal
    const configArg = args.find(a => a.isKind(SyntaxKind.ObjectLiteralExpression));
    if (!configArg || !configArg.isKind(SyntaxKind.ObjectLiteralExpression)) continue;

    const variants = extractVariantsFromConfig(configArg);
    const defaults = extractDefaultVariants(configArg);

    for (const v of variants) {
      if (defaults[v.name]) {
        v.defaultValue = defaults[v.name];
      }
    }

    allVariants.push(...variants);
  }

  return allVariants;
}

export function parseVariantsForComponent(
  project: Project,
  componentDir: string,
  componentName: string,
): VariantMetadata[] {
  const allVariants: VariantMetadata[] = [];
  const seenNames = new Set<string>();

  // Look for variants in classes.ts first (e.g., ButtonBase/classes.ts, Badge/classes.ts)
  const classesFile = project.getSourceFile(`${componentDir}/classes.ts`);
  if (classesFile) {
    for (const v of parseVariantsFromFile(classesFile)) {
      if (!seenNames.has(v.name)) {
        allVariants.push(v);
        seenNames.add(v.name);
      }
    }
  }

  // Then look in the main component file
  const mainFile = project.getSourceFile(`${componentDir}/${componentName}.tsx`);
  if (mainFile) {
    for (const v of parseVariantsFromFile(mainFile)) {
      if (!seenNames.has(v.name)) {
        allVariants.push(v);
        seenNames.add(v.name);
      }
    }
  }

  return allVariants;
}

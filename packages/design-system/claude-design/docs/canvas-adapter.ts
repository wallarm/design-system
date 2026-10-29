import { Project, SyntaxKind, ts } from 'ts-morph';

const globals = [
  'window',
  'document',
  'console',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Date',
  'Math',
  'JSON',
  'Intl',
  'Map',
  'Set',
  'Promise',
  'RegExp',
  'Error',
  'URL',
  'URLSearchParams',
  'File',
  'Blob',
  'navigator',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'parseInt',
  'parseFloat',
  'isNaN',
];

const unboundNames = (code: string): string[] => {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { noLib: true, target: ts.ScriptTarget.ES2022 },
  });
  project.createSourceFile(
    'globals.d.ts',
    globals.map(name => `declare const ${name}: unknown;`).join('\n'),
  );
  const source = project.createSourceFile('adapter.ts', code);
  return [
    ...new Set(
      project
        .getPreEmitDiagnostics()
        .filter(
          diagnostic =>
            [2304, 2552, 18004].includes(diagnostic.getCode()) &&
            diagnostic.getSourceFile() === source,
        )
        .map(diagnostic =>
          code.slice(
            diagnostic.getStart(),
            (diagnostic.getStart() ?? 0) + (diagnostic.getLength() ?? 0),
          ),
        ),
    ),
  ];
};

/** Preserve hook-driven stories only when every runtime reference can be supplied. */
export const toCanvasAdapter = (
  code: string,
  name: string,
  supportCode = '',
  publicNames: ReadonlyMap<string, string> = new Map(),
): string | undefined => {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile('example.tsx', code);
  const support = project.createSourceFile('support.tsx', supportCode);
  // These adapters use the page's createElement; ref-as-prop is handled only inside the bundle.
  if (
    source
      .getDescendantsOfKind(SyntaxKind.JsxAttribute)
      .some(attr => attr.getNameNode().getText() === 'ref')
  )
    return undefined;
  const declaration = source.getVariableDeclarations().find(item => item.isExported());
  if (!declaration) return undefined;
  const componentName = declaration.getName();
  const bindings = new Map<string, string>([['React', 'window.React']]);
  const imported = (module: string, exportedName: string): string | undefined => {
    if (module === 'react') return `React.${exportedName}`;
    if (module.startsWith('@wallarm-org/design-system'))
      return `window.WallarmDS.${module.endsWith('/icons') ? 'Icons.' : ''}${exportedName}`;
    if (module === '@ark-ui/react/collection' && exportedName === 'createListCollection')
      return 'window.WallarmDS.createListCollection';
    if (module.startsWith('.'))
      return publicNames.get(module.includes('/icons') ? `Icons.${exportedName}` : exportedName);
    return undefined;
  };
  for (const item of source.getImportDeclarations()) {
    if (!item.isTypeOnly()) {
      if (item.getDefaultImport() || item.getNamespaceImport()) {
        if (item.getModuleSpecifierValue() !== 'react') return undefined;
        const local = item.getDefaultImport()?.getText() ?? item.getNamespaceImport()?.getText();
        if (local) bindings.set(local, 'window.React');
      }
      for (const named of item.getNamedImports()) {
        if (named.isTypeOnly()) continue;
        const value = imported(item.getModuleSpecifierValue(), named.getName());
        if (!value) return undefined;
        bindings.set(named.getAliasNode()?.getText() ?? named.getName(), value);
      }
    }
    item.remove();
  }
  for (const statement of source.getVariableStatements()) statement.setIsExported(false);
  const dependencies = new Map<string, { position: number; text: string }>();
  const globalName = `WallarmExample${name.replace(/\W/g, '')}`;
  // Resolve only definitions in this story. External mock modules stay explicitly unsupported.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const input =
      `window.${globalName} = (function () {\n` +
      [...bindings].map(([local, value]) => `const ${local} = ${value};`).join('\n') +
      '\n' +
      [...dependencies.values()]
        .sort((a, b) => a.position - b.position)
        .map(item => item.text)
        .join('\n') +
      '\n' +
      source.getFullText() +
      `\nreturn ${componentName};\n})();`;
    const javascript = ts
      .transpileModule(input, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.React,
          module: ts.ModuleKind.None,
          removeComments: true,
        },
        fileName: 'canvas.tsx',
      })
      .outputText.trim();
    const missing = unboundNames(javascript);
    if (!missing.length) {
      if (/\b(?:import|require)\s*\(/.test(javascript)) return undefined;
      return `This stateful example defines a complete canvas adapter. Run the classic JavaScript once, then mount it inside your Root.\n\n\`\`\`js\n${javascript}\n\`\`\`\n\n\`\`\`html\n<x-import component-from-global-scope="${globalName}"></x-import>\n\`\`\``;
    }
    let added = false;
    for (const missingName of missing) {
      if (dependencies.has(missingName) || bindings.has(missingName)) return undefined;
      const variable = support.getVariableDeclaration(missingName);
      const fn = support.getFunction(missingName);
      if (variable) {
        const initializer = variable.getInitializer();
        if (!initializer) return undefined;
        dependencies.set(missingName, {
          position: variable.getStart(),
          text: `const ${missingName} = ${initializer.getText()};`,
        });
        added = true;
      } else if (fn) {
        dependencies.set(missingName, {
          position: fn.getStart(),
          text: fn.getText().replace(/^export\s+/, ''),
        });
        added = true;
      } else {
        for (const item of support.getImportDeclarations()) {
          const named = item
            .getNamedImports()
            .find(
              specifier =>
                (specifier.getAliasNode()?.getText() ?? specifier.getName()) === missingName,
            );
          if (!named || named.isTypeOnly() || item.isTypeOnly()) continue;
          const value = imported(item.getModuleSpecifierValue(), named.getName());
          if (!value) return undefined;
          bindings.set(missingName, value);
          added = true;
        }
        if (!bindings.has(missingName)) return undefined;
      }
    }
    if (!added) return undefined;
  }
  return undefined;
};

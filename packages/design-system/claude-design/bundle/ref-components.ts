import { type PluginObj, types as t } from '@babel/core';

/** Bridge declarations, not namespace copies: internal child.type comparisons stay valid. */
export function refComponentsPlugin(): PluginObj {
  return {
    visitor: {
      Program(program) {
        let used = false;
        const jsxFactories = new Set<string>();
        for (const statement of program.node.body) {
          if (
            t.isImportDeclaration(statement) &&
            /^react\/jsx(?:-dev)?-runtime$/.test(statement.source.value)
          )
            for (const specifier of statement.specifiers)
              if (
                t.isImportSpecifier(specifier) &&
                t.isIdentifier(specifier.imported) &&
                ['jsx', 'jsxs', 'jsxDEV'].includes(specifier.imported.name)
              )
                jsxFactories.add(specifier.local.name);
        }
        const declarations: t.Statement[] = [];
        const bridge = program.scope.generateUidIdentifier('canvasComponent');
        program.traverse({
          FunctionDeclaration(path) {
            const node = path.node;
            if (!node.id || !/^[A-Z]/.test(node.id.name)) return;
            const exported = path.parentPath.isExportNamedDeclaration();
            if (!exported && !path.parentPath.isProgram()) return;
            let rendersJsx = false;
            path.traverse({
              JSXElement() {
                rendersJsx = true;
              },
              JSXFragment() {
                rendersJsx = true;
              },
              CallExpression(call) {
                if (t.isIdentifier(call.node.callee) && jsxFactories.has(call.node.callee.name))
                  rendersJsx = true;
              },
            });
            if (!rendersJsx) return;
            const fn = t.functionExpression(
              t.identifier(node.id.name),
              node.params,
              node.body,
              node.generator,
              node.async,
            );
            const declaration = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(node.id.name),
                t.callExpression(bridge, [fn, t.stringLiteral(node.id.name)]),
              ),
            ]);
            declarations.push(exported ? t.exportNamedDeclaration(declaration) : declaration);
            if (exported) path.parentPath.remove();
            else path.remove();
            used = true;
          },
          VariableDeclarator(path) {
            const { id, init } = path.node;
            if (
              !t.isIdentifier(id) ||
              !/^[A-Z]/.test(id.name) ||
              (!t.isArrowFunctionExpression(init) && !t.isFunctionExpression(init))
            )
              return;
            let rendersJsx = false;
            path.traverse({
              JSXElement() {
                rendersJsx = true;
              },
              JSXFragment() {
                rendersJsx = true;
              },
              CallExpression(call) {
                if (t.isIdentifier(call.node.callee) && jsxFactories.has(call.node.callee.name))
                  rendersJsx = true;
              },
            });
            if (!rendersJsx) return;
            path.node.init = t.callExpression(bridge, [init, t.stringLiteral(id.name)]);
            used = true;
            path.skip();
          },
        });
        if (declarations.length) program.unshiftContainer('body', declarations);
        if (used)
          program.unshiftContainer(
            'body',
            t.importDeclaration(
              [t.importSpecifier(bridge, t.identifier('wrapCanvasComponent'))],
              t.stringLiteral('canvas-component-bridge'),
            ),
          );
      },
    },
  };
}

import { type PluginObj, types as t } from '@babel/core';

/** Bridge declarations, not namespace copies: internal child.type comparisons stay valid. */
export function refComponentsPlugin(): PluginObj {
  return {
    visitor: {
      Program(program) {
        let used = false;
        const bridge = program.scope.generateUidIdentifier('canvasComponent');
        program.traverse({
          VariableDeclarator(path) {
            const { id, init } = path.node;
            if (
              !t.isIdentifier(id) ||
              !/^[A-Z][a-z]/.test(id.name) ||
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
            });
            if (!rendersJsx) return;
            path.node.init = t.callExpression(bridge, [init, t.stringLiteral(id.name)]);
            used = true;
            path.skip();
          },
        });
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

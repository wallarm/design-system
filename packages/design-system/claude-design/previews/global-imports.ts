import { type PluginObj, types as t } from '@babel/core';
import { resolve } from 'node:path';
import { PACKAGE_DIR } from '../config';

export function globalImportsPlugin(filename: string, exportedNames: Set<string>): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        const spec = path.node.source.value;
        if (!spec.startsWith('.')) return;
        const absolute = resolve(filename, '..', spec);
        const icons = absolute.startsWith(resolve(PACKAGE_DIR, 'src/icons'));
        const components = absolute.startsWith(resolve(PACKAGE_DIR, 'src/components'));
        if (!icons && !components && absolute !== resolve(PACKAGE_DIR, 'src/index')) return;
        const declarations: t.VariableDeclarator[] = [];
        path.node.specifiers = path.node.specifiers.filter(item => {
          if (t.isImportSpecifier(item)) {
            const name = t.isIdentifier(item.imported) ? item.imported.name : item.imported.value;
            if (!icons && !exportedNames.has(name)) return true;
            const global = t.memberExpression(t.identifier('window'), t.identifier('WallarmDS'));
            const object = icons ? t.memberExpression(global, t.identifier('Icons')) : global;
            declarations.push(
              t.variableDeclarator(
                item.local,
                t.memberExpression(object, t.stringLiteral(name), true),
              ),
            );
            return false;
          }
          if (icons && t.isImportNamespaceSpecifier(item)) {
            declarations.push(
              t.variableDeclarator(
                item.local,
                t.memberExpression(
                  t.memberExpression(t.identifier('window'), t.identifier('WallarmDS')),
                  t.identifier('Icons'),
                ),
              ),
            );
            return false;
          }
          return true;
        });
        if (declarations.length) path.insertAfter(t.variableDeclaration('const', declarations));
        if (path.node.specifiers.length === 0 && declarations.length) path.remove();
      },
    },
  };
}

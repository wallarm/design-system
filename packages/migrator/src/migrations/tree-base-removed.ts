import type { Migration } from '../lib/types';

const SUBPATH = '@wallarm-org/design-system/TreeBase';
const HINT =
  'TreeBase was removed (it was never exported from the package root): rebuild this tree with TreeView (Ark tree-view) or Tree from @wallarm-org/design-system';

export const migration: Migration = {
  id: 'tree-base-removed',
  title: 'TreeBase removed → use TreeView or Tree',
  transform(file, ctx) {
    for (const decl of file.getImportDeclarations()) {
      if (decl.getModuleSpecifierValue() === SUBPATH) ctx.report(decl, HINT);
    }
  },
};

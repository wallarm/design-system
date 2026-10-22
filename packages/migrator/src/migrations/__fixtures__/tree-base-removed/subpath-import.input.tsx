import { TreeView } from '@wallarm-org/design-system';
import { createTreeCollection, TreeBaseRoot, TreeBaseTree } from '@wallarm-org/design-system/TreeBase';

const collection = createTreeCollection({ rootNode: { id: 'root', children: [] } });

export const Old = () => (
  <TreeBaseRoot collection={collection}>
    <TreeBaseTree />
  </TreeBaseRoot>
);

export const New = () => <TreeView />;

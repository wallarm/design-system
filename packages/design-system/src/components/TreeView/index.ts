import { TreeView as TreeViewRoot } from './TreeView';
import { TreeViewItem } from './TreeViewItem';

type TreeViewComponent = typeof TreeViewRoot & {
  Item: typeof TreeViewItem;
};

const TreeView = TreeViewRoot as TreeViewComponent;
TreeView.Item = TreeViewItem;

export { TreeView };
export { TREE_VIEW_INDENT_STEP, type TreeViewProps } from './TreeView';
export { TreeViewItem, type TreeViewItemProps } from './TreeViewItem';

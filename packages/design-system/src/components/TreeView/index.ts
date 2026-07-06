import { TreeView as TreeViewRoot } from './TreeView';
import { TreeViewItem } from './TreeViewItem';
import { TreeViewToolbar } from './TreeViewToolbar';

type TreeViewComponent = typeof TreeViewRoot & {
  Item: typeof TreeViewItem;
  Toolbar: typeof TreeViewToolbar;
};

const TreeView = TreeViewRoot as TreeViewComponent;
TreeView.Item = TreeViewItem;
TreeView.Toolbar = TreeViewToolbar;

export { TreeView };
export { TREE_VIEW_INDENT_STEP, type TreeViewProps } from './TreeView';
export { TreeViewItem, type TreeViewItemProps } from './TreeViewItem';
export { TreeViewToolbar, type TreeViewToolbarProps } from './TreeViewToolbar';

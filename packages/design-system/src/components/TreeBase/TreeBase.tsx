import type { ComponentProps, FC } from 'react';
import type { TreeNode } from '@ark-ui/react/tree-view';
import { TreeView, type TreeViewRootProps } from '@ark-ui/react/tree-view';
import { cn } from '../../utils/cn';
import {
  treeBranchContentVariants,
  treeBranchControlVariants,
  treeBranchIndentGuideVariants,
  treeBranchVariants,
  treeItemVariants,
  treeListVariants,
  treeRootVariants,
} from './classes';

export type { TreeViewExpandedChangeDetails } from '@ark-ui/react/tree-view';
// Re-export data model utilities
export { createTreeCollection, type TreeCollection, type TreeNode } from '@ark-ui/react/tree-view';

// Root - use the generic Ark component directly so it accepts typed collections
export type TreeBaseRootProps<T extends TreeNode = TreeNode> = TreeViewRootProps<T> & {
  className?: string;
};

export function TreeBaseRoot<T extends TreeNode>({ className, ...props }: TreeBaseRootProps<T>) {
  return (
    <TreeView.Root
      data-slot='tree'
      className={cn(treeRootVariants(), className)}
      {...(props as TreeViewRootProps<TreeNode>)}
    />
  );
}
TreeBaseRoot.displayName = 'TreeBaseRoot';

// Tree (the <ul> list)
type TreeBaseTreeProps = ComponentProps<typeof TreeView.Tree>;

export const TreeBaseTree: FC<TreeBaseTreeProps> = ({ className, ...props }) => (
  <TreeView.Tree data-slot='tree-list' className={cn(treeListVariants(), className)} {...props} />
);
TreeBaseTree.displayName = 'TreeBaseTree';

// NodeProvider
export const TreeBaseNodeProvider = TreeView.NodeProvider;

// Branch (expandable group)
type TreeBaseBranchProps = ComponentProps<typeof TreeView.Branch>;

export const TreeBaseBranch: FC<TreeBaseBranchProps> = ({ className, ...props }) => (
  <TreeView.Branch
    data-slot='tree-branch'
    className={cn(treeBranchVariants(), className)}
    {...props}
  />
);
TreeBaseBranch.displayName = 'TreeBaseBranch';

// BranchControl (clickable trigger area)
type TreeBaseBranchControlProps = ComponentProps<typeof TreeView.BranchControl>;

export const TreeBaseBranchControl: FC<TreeBaseBranchControlProps> = ({ className, ...props }) => (
  <TreeView.BranchControl
    data-slot='tree-branch-control'
    className={cn(treeBranchControlVariants(), className)}
    {...props}
  />
);
TreeBaseBranchControl.displayName = 'TreeBaseBranchControl';

// BranchContent (collapsible area)
type TreeBaseBranchContentProps = ComponentProps<typeof TreeView.BranchContent>;

export const TreeBaseBranchContent: FC<TreeBaseBranchContentProps> = ({ className, ...props }) => (
  <TreeView.BranchContent
    data-slot='tree-branch-content'
    className={cn(treeBranchContentVariants(), className)}
    {...props}
  />
);
TreeBaseBranchContent.displayName = 'TreeBaseBranchContent';

// BranchIndicator
export const TreeBaseBranchIndicator = TreeView.BranchIndicator;

// BranchIndentGuide
type TreeBaseBranchIndentGuideProps = ComponentProps<typeof TreeView.BranchIndentGuide>;

export const TreeBaseBranchIndentGuide: FC<TreeBaseBranchIndentGuideProps> = ({
  className,
  ...props
}) => (
  <TreeView.BranchIndentGuide
    data-slot='tree-indent-guide'
    className={cn(treeBranchIndentGuideVariants(), className)}
    {...props}
  />
);
TreeBaseBranchIndentGuide.displayName = 'TreeBaseBranchIndentGuide';

// BranchText
export const TreeBaseBranchText = TreeView.BranchText;

// BranchTrigger
export const TreeBaseBranchTrigger = TreeView.BranchTrigger;

// Item (leaf node)
type TreeBaseItemProps = ComponentProps<typeof TreeView.Item>;

export const TreeBaseItem: FC<TreeBaseItemProps> = ({ className, ...props }) => (
  <TreeView.Item data-slot='tree-item' className={cn(treeItemVariants(), className)} {...props} />
);
TreeBaseItem.displayName = 'TreeBaseItem';

// ItemText
export const TreeBaseItemText = TreeView.ItemText;

// Label
export const TreeBaseLabel = TreeView.Label;

// Context
export const TreeBaseContext = TreeView.Context;

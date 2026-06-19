import type { FC } from 'react';
import {
  TreeBaseBranch,
  TreeBaseBranchContent,
  TreeBaseBranchControl,
  TreeBaseItem,
  TreeBaseNodeProvider,
} from './TreeBase';
import { TreeViewItemIcon } from './TreeViewItemIcon';
import type { TreeViewNode } from './types';

const BASE_PADDING = 8;
// Must match the `left` value in TreeViewItemIcon (icon center = containingBlock + ICON_LEFT)
const ICON_LEFT = -16;

interface TreeViewNodeRendererProps {
  node: TreeViewNode;
  indexPath: number[];
  depth: number;
  indent: number;
  gap?: number;
  className?: string;
}

export const TreeViewNodeRenderer: FC<TreeViewNodeRendererProps> = ({
  node,
  indexPath,
  depth,
  indent,
  gap,
  className,
}) => {
  const hasChildren = node.children !== undefined && node.children.length > 0;
  const isCollapsible = node.collapsible ?? false;

  // With Ark UI TreeView, items are DOM-nested inside their parent's BranchContent.
  // PaddingLeft on the <li> compounds across levels, so we only add the incremental
  // amount at each depth:
  //   depth=0: BASE_PADDING + indent  (e.g. 8 + 24 = 32)
  //   depth>0: indent                 (e.g. 24)
  // This produces the same visual indent as the old flat layout.
  const itemPadding = depth === 0 ? BASE_PADDING + indent : indent;
  const nestedLineLeft = indent + ICON_LEFT;

  const renderChildren = () => (
    <div className='relative flex flex-col' style={{ gap }}>
      <div
        className='absolute top-0 bottom-0 w-px bg-border-primary-light'
        style={{ left: nestedLineLeft }}
      />
      {node.children!.map((child, idx) => (
        <TreeViewNodeRenderer
          key={child.id}
          node={child}
          indexPath={[...indexPath, idx]}
          depth={depth + 1}
          indent={indent}
          gap={gap}
        />
      ))}
    </div>
  );

  // Leaf node (not collapsible, no children)
  if (!isCollapsible && !hasChildren) {
    return (
      <TreeBaseNodeProvider node={node} indexPath={indexPath}>
        <TreeBaseItem className={className} style={{ paddingLeft: itemPadding }}>
          <div className='group flex w-full items-start justify-between relative pt-2 pb-4'>
            <TreeViewItemIcon icon={node.icon} collapsible={false} />
            <div className='min-w-0 flex-1'>{node.label}</div>
            {node.action && (
              <div className='ml-2 shrink-0' data-slot='tree-view-action'>
                {node.action}
              </div>
            )}
          </div>
        </TreeBaseItem>
      </TreeBaseNodeProvider>
    );
  }

  // Collapsible branch (has content, and optionally children)
  if (isCollapsible) {
    return (
      <TreeBaseNodeProvider node={node} indexPath={indexPath}>
        <TreeBaseBranch
          className={className}
          style={{ paddingLeft: itemPadding, gap: gap ? gap / 2 : undefined }}
        >
          <TreeBaseBranchControl className='group/trigger relative pt-2 pb-4 flex min-w-0 flex-1 items-center text-left cursor-pointer before:absolute before:inset-y-0 before:right-full before:w-[8px]'>
            <TreeViewItemIcon icon={node.icon} collapsible />
            <div className='min-w-0 flex-1'>{node.label}</div>
            {node.action && (
              <div className='ml-2 shrink-0 pt-2' data-slot='tree-view-action'>
                {node.action}
              </div>
            )}
          </TreeBaseBranchControl>

          <TreeBaseBranchContent>
            {node.content}
            {hasChildren && renderChildren()}
          </TreeBaseBranchContent>
        </TreeBaseBranch>
      </TreeBaseNodeProvider>
    );
  }

  // Non-collapsible branch (has children, no content — always visible)
  // No BranchControl → no collapse trigger. Children rendered directly in
  // the Branch without BranchContent so they're always visible regardless
  // of expanded state.
  return (
    <TreeBaseNodeProvider node={node} indexPath={indexPath}>
      <TreeBaseBranch
        className={className}
        style={{ paddingLeft: itemPadding, gap: gap ? gap / 2 : undefined }}
      >
        <div className='group flex w-full items-start justify-between relative pt-2 pb-4'>
          <TreeViewItemIcon icon={node.icon} collapsible={false} />
          <div className='min-w-0 flex-1'>{node.label}</div>
          {node.action && (
            <div className='ml-2 shrink-0' data-slot='tree-view-action'>
              {node.action}
            </div>
          )}
        </div>
        {renderChildren()}
      </TreeBaseBranch>
    </TreeBaseNodeProvider>
  );
};

TreeViewNodeRenderer.displayName = 'TreeViewNodeRenderer';

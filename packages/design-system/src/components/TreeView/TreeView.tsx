import type { FC, HTMLAttributes, Ref } from 'react';
import { useMemo } from 'react';
import type { TreeViewExpandedChangeDetails } from '@ark-ui/react/tree-view';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { createTreeCollection, TreeBaseRoot, TreeBaseTree } from './TreeBase';
import { TreeViewNodeRenderer } from './TreeViewNode';
import type { TreeViewNode } from './types';

export interface TreeViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  nodes: TreeViewNode[];
  indent?: number;
  gap?: number;
  defaultExpandedValue?: string[];
  expandedValue?: string[];
  onExpandedChange?: (details: TreeViewExpandedChangeDetails) => void;
}

function collectBranchIds(nodes: TreeViewNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    const hasChildren = node.children !== undefined && node.children.length > 0;
    const isCollapsible = node.collapsible ?? false;
    const isBranch = isCollapsible || hasChildren;

    if (isBranch) {
      ids.push(node.id);
    }
    if (node.children) {
      ids.push(...collectBranchIds(node.children));
    }
  }
  return ids;
}

export const TreeView: FC<TreeViewProps> = ({
  ref,
  nodes,
  indent = 24,
  gap,
  defaultExpandedValue,
  expandedValue,
  onExpandedChange,
  'data-testid': testId,
  className,
  ...props
}) => {
  const collection = useMemo(
    () =>
      createTreeCollection<TreeViewNode>({
        nodeToValue: node => node.id,
        nodeToString: node => node.id,
        rootNode: { id: 'root', children: nodes } as TreeViewNode,
      }),
    [nodes],
  );

  const resolvedDefaultExpanded = useMemo(
    () => defaultExpandedValue ?? collectBranchIds(nodes),
    [defaultExpandedValue, nodes],
  );

  const content = (
    <TreeBaseRoot
      collection={collection}
      defaultExpandedValue={resolvedDefaultExpanded}
      expandedValue={expandedValue}
      onExpandedChange={onExpandedChange}
    >
      <TreeBaseTree
        ref={ref}
        data-slot='tree-view'
        data-testid={testId}
        className={cn('relative flex flex-col', className)}
        style={{ gap }}
        {...props}
      >
        <div
          className='absolute top-0 bottom-0 w-px bg-border-primary-light'
          style={{ left: indent - 8 }}
        />
        {nodes.map((node, idx) => (
          <TreeViewNodeRenderer
            key={node.id}
            node={node}
            indexPath={[idx]}
            depth={0}
            indent={indent}
            gap={gap}
          />
        ))}
      </TreeBaseTree>
    </TreeBaseRoot>
  );

  if (testId !== undefined) {
    return <TestIdProvider value={testId}>{content}</TestIdProvider>;
  }

  return content;
};

TreeView.displayName = 'TreeView';

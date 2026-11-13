import { useState } from 'react';
import * as z from 'zod';
import { Badge, type BadgeColor } from '@wallarm-org/design-system/Badge';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { Text } from '@wallarm-org/design-system/Text';
import { Tree, TreeItem, TreeItemContent, TreeItemHeader } from '@wallarm-org/design-system/Tree';
import { defineComponent, subsetOf } from '../core/define';

const node = z.object({
  label: z.string(),
  depth: z.number().int().min(0).max(8),
  badge: z
    .object({
      text: z.string(),
      color: z.enum(subsetOf<BadgeColor>()(['slate', 'red', 'amber', 'green', 'blue'])).optional(),
    })
    .optional(),
});

type FlatNode = z.infer<typeof node>;
interface Folded extends FlatNode {
  key: number;
  kids: Folded[];
}

/** Flat display-order list → nested items: each node goes under the last shallower one. */
const fold = (nodes: FlatNode[]): Folded[] => {
  const roots: Folded[] = [];
  const stack: Folded[] = [];
  nodes.forEach((n, key) => {
    const item: Folded = { ...n, key, kids: [] };
    stack.length = n.depth;
    (stack.at(-1)?.kids ?? roots).push(item);
    stack.push(item);
  });
  return roots;
};

const Node = ({ item }: { item: Folded }) => {
  const [open, setOpen] = useState(true);
  // truncate: an unbroken agent label must not push the row wider than the surface
  const label = (
    <Text size='sm' truncate>
      {item.label}
    </Text>
  );
  const badge = item.badge && (
    <Badge type='secondary' color={item.badge.color ?? 'slate'}>
      {item.badge.text}
    </Badge>
  );
  if (item.kids.length === 0) {
    return (
      <TreeItem>
        <TreeItemHeader action={badge}>{label}</TreeItemHeader>
      </TreeItem>
    );
  }
  return (
    <TreeItem collapsible open={open} onOpenChange={setOpen}>
      <TreeItemHeader action={badge}>{label}</TreeItemHeader>
      {/* inert: the DS only hides closed content visually; keep it out of focus and a11y too */}
      <TreeItemContent inert={!open}>
        <Nodes items={item.kids} />
      </TreeItemContent>
    </TreeItem>
  );
};

const Nodes = ({ items }: { items: Folded[] }) => (
  <Tree>
    {items.map(item => (
      <Node key={item.key} item={item} />
    ))}
  </Tree>
);

export const TreeComponent = defineComponent({
  name: 'Tree',
  description:
    'A read-only hierarchy, e.g. hosts > paths > endpoints. List nodes flat in display order, each with its depth: 0 for a top level node, a child is its parent depth + 1, and it follows its parent and earlier siblings. Optional badge per node (a count or a status).',
  props: z.object({
    nodes: z
      .array(node)
      .min(1)
      .max(500)
      .refine(
        nodes => nodes.every((n, i) => n.depth <= (nodes[i - 1]?.depth ?? -1) + 1),
        'the first depth is 0 and each depth is at most the previous + 1',
      ),
  }),
  Skeleton: () => (
    <div className='flex flex-col gap-8'>
      <Skeleton width='40%' height='20px' transparent={false} />
      <Skeleton width='35%' height='20px' transparent={false} className='ml-16' />
      <Skeleton width='30%' height='20px' transparent={false} className='ml-32' />
      <Skeleton width='35%' height='20px' transparent={false} className='ml-16' />
    </div>
  ),
  View: ({ props }) => <Nodes items={fold(props.nodes)} />,
});

import { type ReactNode, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  Folder,
  PanelRightClose,
  Search,
} from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Text } from '../Text';
import { TreeView, type TreeViewProps } from './TreeView';
import { TreeViewItem } from './TreeViewItem';

const meta = {
  title: 'Navigation/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TreeView is a hierarchical explorer built as a compound component (`<TreeView>`, `<TreeViewItem>`). Compose each row freely with children (icon, badge, text); nested `<TreeViewItem>` children become the collapsible subtree. Rows support selection, checkboxes, disabled state, and a custom `rightElement`. A header or search box is assembled from existing components (see the WithHeader and WithSearch stories). Depth-based connector rails are drawn automatically.',
      },
    },
  },
} satisfies Meta<typeof TreeView>;

export default meta;

const CountBadge = ({ value }: { value: number }) => (
  <Badge size='small' color='slate' type='secondary' textVariant='code'>
    {value}
  </Badge>
);

export const Basic: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem defaultOpen>
        <Folder />
        Components
        <TreeViewItem>
          <FileText />
          Button.tsx
        </TreeViewItem>
        <TreeViewItem>
          <FileText />
          Input.tsx
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem>
        <Folder />
        Utils
        <TreeViewItem>
          <FileText />
          cn.ts
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem>
        <FileText />
        index.ts
      </TreeViewItem>
    </TreeView>
  </div>
);

export const Nested: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem defaultOpen rightElement={<CountBadge value={4} />}>
        <Folder />
        src
        <TreeViewItem defaultOpen rightElement={<CountBadge value={2} />}>
          <Folder />
          components
          <TreeViewItem defaultOpen>
            <Folder />
            TreeView
            <TreeViewItem>
              <FileText />
              TreeView.tsx
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem>
            <FileText />
            Button.tsx
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem>
          <FileText />
          index.ts
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem rightElement={<CountBadge value={1} />}>
        <Folder />
        public
        <TreeViewItem>
          <FileText />
          favicon.ico
        </TreeViewItem>
      </TreeViewItem>
    </TreeView>
  </div>
);

export const WithCheckboxes: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView checkboxes {...args}>
      <TreeViewItem defaultOpen>
        <Folder />
        Endpoints
        <TreeViewItem>
          <FileText />
          /users
        </TreeViewItem>
        <TreeViewItem>
          <FileText />
          /orders
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem>
        <FileText />
        /health
      </TreeViewItem>
    </TreeView>
  </div>
);

export const Selectable: StoryFn<TreeViewProps> = () => {
  const [selected, setSelected] = useState<string[]>(['button']);
  return (
    <div className='w-320'>
      <TreeView selectable selectedIds={selected} onSelectionChange={setSelected}>
        <TreeViewItem id='components' defaultOpen>
          <Folder />
          Components
          <TreeViewItem id='button'>
            <FileText />
            Button.tsx
          </TreeViewItem>
          <TreeViewItem id='input'>
            <FileText />
            Input.tsx
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id='index'>
          <FileText />
          index.ts
        </TreeViewItem>
      </TreeView>
    </div>
  );
};

export const WithInlineBadge: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem defaultOpen>
        <Folder />
        Endpoints
        <TreeViewItem>
          <FileText />
          <Badge color='slate' size='small'>
            new
          </Badge>
          /users
        </TreeViewItem>
        <TreeViewItem>
          <FileText />
          <Badge color='green' type='secondary' size='small' textVariant='code'>
            GET
          </Badge>
          /orders
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem>
        <FileText />
        <Badge color='amber' size='small'>
          wip
        </Badge>
        /health
      </TreeViewItem>
    </TreeView>
  </div>
);

export const Disabled: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView selectable {...args}>
      <TreeViewItem id='components' defaultOpen>
        <Folder />
        Components
        <TreeViewItem id='button'>
          <FileText />
          Button.tsx
        </TreeViewItem>
        <TreeViewItem id='input' disabled>
          <FileText />
          Input.tsx (disabled)
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem disabled>
        <Folder />
        Utils (disabled)
        <TreeViewItem>
          <FileText />
          cn.ts
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem id='index'>
        <FileText />
        index.ts
      </TreeViewItem>
    </TreeView>
  </div>
);

interface SearchNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  children?: SearchNode[];
}

const TREE_DATA: SearchNode[] = [
  {
    id: 'src',
    label: 'src',
    type: 'folder',
    children: [
      {
        id: 'components',
        label: 'components',
        type: 'folder',
        children: [
          { id: 'button', label: 'Button.tsx', type: 'file' },
          { id: 'input', label: 'Input.tsx', type: 'file' },
          { id: 'treeview', label: 'TreeView.tsx', type: 'file' },
        ],
      },
      { id: 'index', label: 'index.ts', type: 'file' },
    ],
  },
  {
    id: 'utils',
    label: 'utils',
    type: 'folder',
    children: [
      { id: 'cn', label: 'cn.ts', type: 'file' },
      { id: 'format', label: 'formatValue.ts', type: 'file' },
    ],
  },
  { id: 'readme', label: 'README.md', type: 'file' },
];

const BRANCH_IDS = ['src', 'components', 'utils'];

/**
 * The header and search are assembled from existing components (Text, Button,
 * Input) — TreeView has no dedicated toolbar. Expand-all / collapse-all drive
 * the items' controlled `open` state, and the search filters the tree by label
 * (keeping ancestors of matches and auto-expanding them).
 */
export const WithHeaderAndSearch: StoryFn<TreeViewProps> = () => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['src', 'components']));

  const isOpen = (id: string) => (q ? true : openIds.has(id));
  const toggle = (id: string, v: boolean) =>
    setOpenIds(prev => {
      const next = new Set(prev);
      if (v) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  const setAll = (open: boolean) => setOpenIds(open ? new Set(BRANCH_IDS) : new Set());

  const renderNode = (node: SearchNode): ReactNode => {
    const selfMatch = !q || node.label.toLowerCase().includes(q);
    const icon = node.type === 'folder' ? <Folder /> : <FileText />;

    if (node.children) {
      const kids = node.children.map(renderNode).filter(Boolean);
      if (q && !selfMatch && kids.length === 0) {
        return null;
      }
      return (
        <TreeViewItem key={node.id} open={isOpen(node.id)} onOpenChange={v => toggle(node.id, v)}>
          {icon}
          {node.label}
          {kids}
        </TreeViewItem>
      );
    }

    if (!selfMatch) {
      return null;
    }
    return (
      <TreeViewItem key={node.id}>
        {icon}
        {node.label}
      </TreeViewItem>
    );
  };

  const nodes = TREE_DATA.map(renderNode).filter(Boolean);

  return (
    <div className='w-320'>
      <TreeView>
        {/* Header — expand/collapse buttons grouped tightly, close set apart */}
        <div className='flex items-center gap-8 px-8 pt-8 pb-4'>
          <Text size='xs' weight='medium' color='secondary' grow truncate>
            Header
          </Text>
          <div className='flex shrink-0 items-center gap-8'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Collapse all'
                onClick={() => setAll(false)}
              >
                <ChevronsDownUp size='sm' />
              </Button>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Expand all'
                onClick={() => setAll(true)}
              >
                <ChevronsUpDown size='sm' />
              </Button>
            </div>
            <Button variant='ghost' color='neutral' size='small' aria-label='Close panel'>
              <PanelRightClose size='sm' />
            </Button>
          </div>
        </div>

        {/* Search — full width, aligned with the items' selection highlight */}
        <div className='pb-4'>
          <div className='relative'>
            <Search
              size='md'
              className='pointer-events-none absolute top-1/2 left-12 -translate-y-1/2 text-text-secondary'
            />
            <Input
              placeholder='Search'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className='pl-40'
            />
          </div>
        </div>

        {nodes}
      </TreeView>
    </div>
  );
};

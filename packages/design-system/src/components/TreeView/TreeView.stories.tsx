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
import { Checkbox } from '../Checkbox';
import { CheckboxIndicator } from '../Checkbox/CheckboxIndicator';
import { Input } from '../Input';
import { Text } from '../Text';
import { TreeView, type TreeViewProps } from './TreeView';
import { TreeViewItem } from './TreeViewItem';

const DESCRIPTION = [
  'The interactive hierarchy: rows that expand, select and disable, with the connector rails drawn for you.',
  'Reach for `Tree` when you only need to *show* nesting — this one is for working in it. Rows are composed freely, so an icon, a badge or a checkbox is just a child, and nested `TreeViewItem`s become the subtree.',
].join(' ');

const meta = {
  title: 'Navigation/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
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

/** One level of rows. Each `TreeViewItem` is composed like any row — the component supplies the rail, the indentation and the toggle. */
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

/** Nested items become the collapsible subtree, which is also what marks the parent as a branch. Branches start closed. */
export const Nested: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem defaultOpen>
        <Folder />
        src
        <TreeViewItem defaultOpen>
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
      <TreeViewItem>
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

/** The tree has no checkbox logic: the checkbox is a child, the checked set is yours, and the click has to be stopped from reaching row selection. */
export const WithCheckboxes: StoryFn<TreeViewProps> = () => {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(['users']));
  const cb = (id: string) => (
    <Checkbox
      checked={checked.has(id)}
      onClick={e => e.stopPropagation()}
      onCheckedChange={details =>
        setChecked(prev => {
          const next = new Set(prev);
          if (details.checked === true) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        })
      }
      className='shrink-0'
    >
      <CheckboxIndicator />
    </Checkbox>
  );

  return (
    <div className='w-320'>
      <TreeView>
        <TreeViewItem defaultOpen>
          {cb('endpoints')}
          <Folder />
          Endpoints
          <TreeViewItem>
            {cb('users')}
            <FileText />
            /users
          </TreeViewItem>
          <TreeViewItem>
            {cb('orders')}
            <FileText />
            /orders
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem>
          {cb('health')}
          <FileText />
          /health
        </TreeViewItem>
      </TreeView>
    </div>
  );
};

/** `selectable` (with `multiSelect` for more than one) turns rows into a selection, controlled through `selectedIds` or left to the component. */
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

/** A badge beside the label, for a count that belongs to the row rather than to its children. */
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

/** The label is `flex-1`, so anything after it lands against the right edge — which is how a count or a tag ends up trailing without any prop for it. */
export const WithTrailingContent: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem defaultOpen>
        <Folder />
        src
        <CountBadge value={3} />
        <TreeViewItem>
          <FileText />
          index.ts
          <CountBadge value={12} />
        </TreeViewItem>
        <TreeViewItem>
          <FileText />
          config.ts
          <Badge color='blue' size='small'>
            label
          </Badge>
        </TreeViewItem>
        <TreeViewItem>
          <FileText />
          types.ts
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem>
        <Folder />
        public
        <CountBadge value={1} />
        <TreeViewItem>
          <FileText />
          favicon.ico
        </TreeViewItem>
      </TreeViewItem>
    </TreeView>
  </div>
);

/** A disabled row dims and stops responding to everything: toggle, selection and checkbox alike. */
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

/** The toolbar is assembled from `Text`, `Button` and `Input` — there is no TreeView toolbar. Expand-all drives the items’ controlled `open` state, and the search keeps ancestors of matches and opens them. */
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

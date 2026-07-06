import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FileText, Folder } from '../../icons';
import { Badge } from '../Badge';
import { TreeView, type TreeViewProps } from './TreeView';
import { TreeViewItem } from './TreeViewItem';
import { TreeViewToolbar } from './TreeViewToolbar';

const meta = {
  title: 'Navigation/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TreeView is a hierarchical explorer built as a compound component (`<TreeView>`, `<TreeViewItem>`, `<TreeViewToolbar>`). Branches expand via an inline box toggle, rows support selection, checkboxes, counts, and custom left/right slots. Depth-based connector rails are drawn automatically.',
      },
    },
  },
} satisfies Meta<typeof TreeView>;

export default meta;

export const Basic: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem icon={<Folder />} label='Components' defaultOpen>
        <TreeViewItem icon={<FileText />} label='Button.tsx' />
        <TreeViewItem icon={<FileText />} label='Input.tsx' />
      </TreeViewItem>
      <TreeViewItem icon={<Folder />} label='Utils'>
        <TreeViewItem icon={<FileText />} label='cn.ts' />
      </TreeViewItem>
      <TreeViewItem icon={<FileText />} label='index.ts' />
    </TreeView>
  </div>
);

export const Nested: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem icon={<Folder />} label='src' defaultOpen count={4}>
        <TreeViewItem icon={<Folder />} label='components' defaultOpen count={2}>
          <TreeViewItem icon={<Folder />} label='TreeView' defaultOpen>
            <TreeViewItem
              label={
                <Badge color='green' type='secondary' size='small' textVariant='code'>
                  GET
                </Badge>
              }
            />
            <TreeViewItem icon={<FileText />} label='TreeView.tsx' />
          </TreeViewItem>
          <TreeViewItem icon={<FileText />} label='Button.tsx' />
        </TreeViewItem>
        <TreeViewItem icon={<FileText />} label='index.ts' />
      </TreeViewItem>
      <TreeViewItem icon={<Folder />} label='public' count={1}>
        <TreeViewItem icon={<FileText />} label='favicon.ico' />
      </TreeViewItem>
    </TreeView>
  </div>
);

export const WithCheckboxes: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView checkboxes {...args}>
      <TreeViewItem icon={<Folder />} label='Endpoints' defaultOpen>
        <TreeViewItem icon={<FileText />} label='/users' />
        <TreeViewItem icon={<FileText />} label='/orders' />
      </TreeViewItem>
      <TreeViewItem icon={<FileText />} label='/health' />
    </TreeView>
  </div>
);

export const Selectable: StoryFn<TreeViewProps> = () => {
  const [selected, setSelected] = useState<string[]>(['button']);
  return (
    <div className='w-320'>
      <TreeView selectable selectedIds={selected} onSelectionChange={setSelected}>
        <TreeViewItem id='components' icon={<Folder />} label='Components' defaultOpen>
          <TreeViewItem id='button' icon={<FileText />} label='Button.tsx' />
          <TreeViewItem id='input' icon={<FileText />} label='Input.tsx' />
        </TreeViewItem>
        <TreeViewItem id='index' icon={<FileText />} label='index.ts' />
      </TreeView>
    </div>
  );
};

export const WithInlineBadge: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView {...args}>
      <TreeViewItem icon={<Folder />} label='Endpoints' defaultOpen>
        <TreeViewItem
          icon={<FileText />}
          startContent={
            <Badge color='slate' size='small'>
              new
            </Badge>
          }
          label='/users'
        />
        <TreeViewItem
          icon={<FileText />}
          startContent={
            <Badge color='green' type='secondary' size='small' textVariant='code'>
              GET
            </Badge>
          }
          label='/orders'
        />
      </TreeViewItem>
      <TreeViewItem
        icon={<FileText />}
        startContent={
          <Badge color='amber' size='small'>
            wip
          </Badge>
        }
        label='/health'
      />
    </TreeView>
  </div>
);

export const Disabled: StoryFn<TreeViewProps> = args => (
  <div className='w-320'>
    <TreeView selectable {...args}>
      <TreeViewItem id='components' icon={<Folder />} label='Components' defaultOpen>
        <TreeViewItem id='button' icon={<FileText />} label='Button.tsx' />
        <TreeViewItem id='input' icon={<FileText />} label='Input.tsx (disabled)' disabled />
      </TreeViewItem>
      <TreeViewItem icon={<Folder />} label='Utils (disabled)' disabled>
        <TreeViewItem icon={<FileText />} label='cn.ts' />
      </TreeViewItem>
      <TreeViewItem id='index' icon={<FileText />} label='index.ts' />
    </TreeView>
  </div>
);

export const WithToolbar: StoryFn<TreeViewProps> = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({ src: true, components: true });
  const setAll = (value: boolean) => setOpen({ src: value, components: value });
  return (
    <div className='w-320'>
      <TreeView>
        <TreeViewToolbar
          title='Header'
          onExpandAll={() => setAll(true)}
          onCollapseAll={() => setAll(false)}
          onClose={() => undefined}
        />
        <TreeViewItem
          icon={<Folder />}
          label='src'
          count={2}
          open={open.src}
          onOpenChange={v => setOpen(s => ({ ...s, src: v }))}
        >
          <TreeViewItem
            icon={<Folder />}
            label='components'
            open={open.components}
            onOpenChange={v => setOpen(s => ({ ...s, components: v }))}
          >
            <TreeViewItem icon={<FileText />} label='Button.tsx' />
            <TreeViewItem icon={<FileText />} label='Input.tsx' />
          </TreeViewItem>
          <TreeViewItem icon={<FileText />} label='index.ts' />
        </TreeViewItem>
        <TreeViewItem icon={<FileText />} label='package.json' count={1} />
      </TreeView>
    </div>
  );
};

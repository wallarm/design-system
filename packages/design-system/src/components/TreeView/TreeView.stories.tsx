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
          'TreeView is a hierarchical explorer built as a compound component (`<TreeView>`, `<TreeViewItem>`, `<TreeViewToolbar>`). Compose each row freely with children (icon, badge, text); nested `<TreeViewItem>` children become the collapsible subtree. Rows support selection, checkboxes, counts, disabled state, and custom right-side actions. Depth-based connector rails are drawn automatically.',
      },
    },
  },
} satisfies Meta<typeof TreeView>;

export default meta;

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
      <TreeViewItem defaultOpen count={4}>
        <Folder />
        src
        <TreeViewItem defaultOpen count={2}>
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
      <TreeViewItem count={1}>
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
          count={2}
          open={open.src}
          onOpenChange={v => setOpen(s => ({ ...s, src: v }))}
        >
          <Folder />
          src
          <TreeViewItem
            open={open.components}
            onOpenChange={v => setOpen(s => ({ ...s, components: v }))}
          >
            <Folder />
            components
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
            <FileText />
            index.ts
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem count={1}>
          <FileText />
          package.json
        </TreeViewItem>
      </TreeView>
    </div>
  );
};

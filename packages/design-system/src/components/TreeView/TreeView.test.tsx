import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TreeView } from './TreeView';
import { TreeViewItem } from './TreeViewItem';
import { TreeViewToolbar } from './TreeViewToolbar';

describe('Node rendering', () => {
  it('renders leaf and branch items', () => {
    render(
      <TreeView>
        <TreeViewItem label='Parent' defaultOpen>
          <TreeViewItem label='Child' />
        </TreeViewItem>
        <TreeViewItem label='Sibling' />
      </TreeView>,
    );

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByText('Sibling')).toBeInTheDocument();
  });

  it('renders a count badge on the right slot', () => {
    render(
      <TreeView>
        <TreeViewItem label='Folder' count={5} />
      </TreeView>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders custom label content (left slot)', () => {
    render(
      <TreeView>
        <TreeViewItem label={<span data-testid='custom'>GET</span>} />
      </TreeView>,
    );

    expect(screen.getByTestId('custom')).toHaveTextContent('GET');
  });
});

describe('data-slot attributes', () => {
  it('renders data-slot="tree-view" on the root', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Item' />
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view"]')).toBeInTheDocument();
  });

  it('renders data-slot="tree-view-item" on items', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='A' />
        <TreeViewItem label='B' />
      </TreeView>,
    );

    expect(container.querySelectorAll('[data-slot="tree-view-item"]')).toHaveLength(2);
  });

  it('renders a toggle on branches and a spacer on leaves', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Branch'>
          <TreeViewItem label='Leaf' />
        </TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view-toggle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="tree-view-toggle-spacer"]')).toBeInTheDocument();
  });
});

describe('ARIA roles', () => {
  it('applies tree, treeitem and group roles', () => {
    render(
      <TreeView>
        <TreeViewItem label='Parent' defaultOpen>
          <TreeViewItem label='Child' />
        </TreeViewItem>
      </TreeView>,
    );

    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('sets aria-expanded on branch items only', () => {
    render(
      <TreeView>
        <TreeViewItem label='Branch' defaultOpen={false}>
          <TreeViewItem label='Leaf' />
        </TreeViewItem>
      </TreeView>,
    );

    const branch = screen.getByText('Branch').closest('[role="treeitem"]');
    expect(branch).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('data-testid', () => {
  it('forwards and cascades data-testid', () => {
    const { container } = render(
      <TreeView data-testid='files'>
        <TreeViewItem label='Item' />
      </TreeView>,
    );

    expect(screen.getByTestId('files')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="files--item"]')).toBeInTheDocument();
  });

  it('does not render data-testid when none is provided', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Item' />
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view"]')).not.toHaveAttribute('data-testid');
  });
});

describe('Expand / collapse', () => {
  it('hides the group when closed', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Branch' defaultOpen={false}>
          <TreeViewItem label='Child' />
        </TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view-group"]')).toHaveAttribute('hidden');
  });

  it('toggles open state when the toggle is clicked', async () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Branch' defaultOpen={false}>
          <TreeViewItem label='Child' />
        </TreeViewItem>
      </TreeView>,
    );

    const toggle = container.querySelector('[data-slot="tree-view-toggle"]') as HTMLElement;
    const group = container.querySelector('[data-slot="tree-view-group"]') as HTMLElement;

    expect(group).toHaveAttribute('hidden');
    await userEvent.click(toggle);
    expect(group).not.toHaveAttribute('hidden');
  });

  it('calls onOpenChange when toggled', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Branch' defaultOpen={false} onOpenChange={onOpenChange}>
          <TreeViewItem label='Child' />
        </TreeViewItem>
      </TreeView>,
    );

    const toggle = container.querySelector('[data-slot="tree-view-toggle"]') as HTMLElement;
    await userEvent.click(toggle);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('respects controlled open state', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Branch' open>
          <TreeViewItem label='Child' />
        </TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view-group"]')).not.toHaveAttribute('hidden');
  });
});

describe('Selection', () => {
  it('selects a row on click and marks aria-selected', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a' label='Alpha' />
        <TreeViewItem id='b' label='Beta' />
      </TreeView>,
    );

    await userEvent.click(screen.getByText('Alpha'));

    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
    expect(screen.getByText('Alpha').closest('[role="treeitem"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('replaces selection in single-select mode', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a' label='Alpha' />
        <TreeViewItem id='b' label='Beta' />
      </TreeView>,
    );

    await userEvent.click(screen.getByText('Alpha'));
    await userEvent.click(screen.getByText('Beta'));

    expect(onSelectionChange).toHaveBeenLastCalledWith(['b']);
  });

  it('accumulates selection in multi-select mode', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable multiSelect onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a' label='Alpha' />
        <TreeViewItem id='b' label='Beta' />
      </TreeView>,
    );

    await userEvent.click(screen.getByText('Alpha'));
    await userEvent.click(screen.getByText('Beta'));

    expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'b']);
  });
});

describe('Checkbox', () => {
  it('renders a checkbox when tree-level checkboxes is set', () => {
    render(
      <TreeView checkboxes>
        <TreeViewItem label='Item' />
      </TreeView>,
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onCheckedChange without selecting the row', async () => {
    const onCheckedChange = vi.fn();
    render(
      <TreeView selectable>
        <TreeViewItem id='a' label='Item' checkbox onCheckedChange={onCheckedChange} />
      </TreeView>,
    );

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Item').closest('[role="treeitem"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});

describe('Keyboard', () => {
  it('toggles a branch with ArrowRight / ArrowLeft', async () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem label='Branch' defaultOpen={false}>
          <TreeViewItem label='Child' />
        </TreeViewItem>
      </TreeView>,
    );

    const branch = screen.getByText('Branch').closest('[role="treeitem"]') as HTMLElement;
    const group = container.querySelector('[data-slot="tree-view-group"]') as HTMLElement;

    branch.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(group).not.toHaveAttribute('hidden');

    await userEvent.keyboard('{ArrowLeft}');
    expect(group).toHaveAttribute('hidden');
  });

  it('selects a row with Enter', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a' label='Alpha' />
      </TreeView>,
    );

    const item = screen.getByText('Alpha').closest('[role="treeitem"]') as HTMLElement;
    item.focus();
    await userEvent.keyboard('{Enter}');

    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
  });
});

describe('Toolbar', () => {
  it('renders the title and action buttons', async () => {
    const onExpandAll = vi.fn();
    const onCollapseAll = vi.fn();
    const onClose = vi.fn();
    render(
      <TreeView>
        <TreeViewToolbar
          title='Header'
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          onClose={onClose}
        />
        <TreeViewItem label='Item' />
      </TreeView>,
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    await userEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onExpandAll).toHaveBeenCalledOnce();
    expect(onCollapseAll).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

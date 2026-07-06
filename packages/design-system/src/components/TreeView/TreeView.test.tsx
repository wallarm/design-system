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
        <TreeViewItem defaultOpen>
          Parent
          <TreeViewItem>Child</TreeViewItem>
        </TreeViewItem>
        <TreeViewItem>Sibling</TreeViewItem>
      </TreeView>,
    );

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByText('Sibling')).toBeInTheDocument();
  });

  it('renders rightElement content on the right slot', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem rightElement={<span data-testid='count'>5</span>}>Folder</TreeViewItem>
      </TreeView>,
    );

    const right = container.querySelector('[data-slot="tree-view-right"]');
    expect(right).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });

  it('renders composed children (icon, badge, text) as row content', () => {
    render(
      <TreeView>
        <TreeViewItem>
          <span data-testid='icon' />
          <span data-testid='badge'>new</span>
          Endpoint
        </TreeViewItem>
      </TreeView>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toHaveTextContent('new');
    expect(screen.getByText('Endpoint')).toBeInTheDocument();
    // badge sits before the text label in DOM order
    expect(
      screen.getByTestId('badge').compareDocumentPosition(screen.getByText('Endpoint')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('data-slot attributes', () => {
  it('renders data-slot="tree-view" on the root', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem>Item</TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view"]')).toBeInTheDocument();
  });

  it('renders data-slot="tree-view-item" on items', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem>A</TreeViewItem>
        <TreeViewItem>B</TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelectorAll('[data-slot="tree-view-item"]')).toHaveLength(2);
  });

  it('renders a toggle on branches and a spacer on leaves', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem>
          Branch
          <TreeViewItem>Leaf</TreeViewItem>
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
        <TreeViewItem defaultOpen>
          Parent
          <TreeViewItem>Child</TreeViewItem>
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
        <TreeViewItem defaultOpen={false}>
          Branch
          <TreeViewItem>Leaf</TreeViewItem>
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
        <TreeViewItem>Item</TreeViewItem>
      </TreeView>,
    );

    expect(screen.getByTestId('files')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="files--item"]')).toBeInTheDocument();
  });

  it('does not render data-testid when none is provided', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem>Item</TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view"]')).not.toHaveAttribute('data-testid');
  });
});

describe('Expand / collapse', () => {
  it('hides the group when closed', () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem defaultOpen={false}>
          Branch
          <TreeViewItem>Child</TreeViewItem>
        </TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view-group"]')).toHaveAttribute(
      'data-state',
      'closed',
    );
  });

  it('toggles open state when the toggle is clicked', async () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem defaultOpen={false}>
          Branch
          <TreeViewItem>Child</TreeViewItem>
        </TreeViewItem>
      </TreeView>,
    );

    const toggle = container.querySelector('[data-slot="tree-view-toggle"]') as HTMLElement;
    const group = container.querySelector('[data-slot="tree-view-group"]') as HTMLElement;

    expect(group).toHaveAttribute('data-state', 'closed');
    await userEvent.click(toggle);
    expect(group).toHaveAttribute('data-state', 'open');
  });

  it('calls onOpenChange when toggled', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <TreeView>
        <TreeViewItem defaultOpen={false} onOpenChange={onOpenChange}>
          Branch
          <TreeViewItem>Child</TreeViewItem>
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
        <TreeViewItem open>
          Branch
          <TreeViewItem>Child</TreeViewItem>
        </TreeViewItem>
      </TreeView>,
    );

    expect(container.querySelector('[data-slot="tree-view-group"]')).toHaveAttribute(
      'data-state',
      'open',
    );
  });
});

describe('Selection', () => {
  it('selects a row on click and marks aria-selected', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a'>Alpha</TreeViewItem>
        <TreeViewItem id='b'>Beta</TreeViewItem>
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
        <TreeViewItem id='a'>Alpha</TreeViewItem>
        <TreeViewItem id='b'>Beta</TreeViewItem>
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
        <TreeViewItem id='a'>Alpha</TreeViewItem>
        <TreeViewItem id='b'>Beta</TreeViewItem>
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
        <TreeViewItem>Item</TreeViewItem>
      </TreeView>,
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onCheckedChange without selecting the row', async () => {
    const onCheckedChange = vi.fn();
    render(
      <TreeView selectable>
        <TreeViewItem id='a' checkbox onCheckedChange={onCheckedChange}>
          Item
        </TreeViewItem>
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

describe('Disabled', () => {
  it('marks the row aria-disabled and does not select on click', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a' disabled>
          Alpha
        </TreeViewItem>
      </TreeView>,
    );

    const item = screen.getByText('Alpha').closest('[role="treeitem"]') as HTMLElement;
    expect(item).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(screen.getByText('Alpha'));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('does not toggle a disabled branch and disables its toggle button', async () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem defaultOpen={false} disabled>
          Branch
          <TreeViewItem>Child</TreeViewItem>
        </TreeViewItem>
      </TreeView>,
    );

    const toggle = container.querySelector('[data-slot="tree-view-toggle"]') as HTMLButtonElement;
    const group = container.querySelector('[data-slot="tree-view-group"]') as HTMLElement;

    expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    expect(group).toHaveAttribute('data-state', 'closed');
  });

  it('disables the checkbox', () => {
    render(
      <TreeView>
        <TreeViewItem checkbox disabled>
          Item
        </TreeViewItem>
      </TreeView>,
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});

describe('Keyboard', () => {
  it('toggles a branch with ArrowRight / ArrowLeft', async () => {
    const { container } = render(
      <TreeView>
        <TreeViewItem defaultOpen={false}>
          Branch
          <TreeViewItem>Child</TreeViewItem>
        </TreeViewItem>
      </TreeView>,
    );

    const branch = screen.getByText('Branch').closest('[role="treeitem"]') as HTMLElement;
    const group = container.querySelector('[data-slot="tree-view-group"]') as HTMLElement;

    branch.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(group).toHaveAttribute('data-state', 'open');

    await userEvent.keyboard('{ArrowLeft}');
    expect(group).toHaveAttribute('data-state', 'closed');
  });

  it('selects a row with Enter', async () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView selectable onSelectionChange={onSelectionChange}>
        <TreeViewItem id='a'>Alpha</TreeViewItem>
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
        <TreeViewItem>Item</TreeViewItem>
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

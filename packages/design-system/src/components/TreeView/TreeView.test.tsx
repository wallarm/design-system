import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TreeView } from './TreeView';
import type { TreeViewNode } from './types';

describe('Node rendering', () => {
  it('renders leaf nodes', () => {
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Item 1' },
      { id: '2', label: 'Item 2' },
    ];

    render(<TreeView nodes={nodes} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders nodes with content as expandable branches', () => {
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Branch', collapsible: true, content: <span>Hidden content</span> },
    ];

    render(<TreeView nodes={nodes} />);

    expect(screen.getByText('Branch')).toBeInTheDocument();
    expect(screen.getByText('Hidden content')).toBeInTheDocument();
  });

  it('renders nested nodes', () => {
    const nodes: TreeViewNode[] = [
      {
        id: '1',
        label: 'Parent',
        children: [{ id: '1.1', label: 'Child' }],
      },
    ];

    render(<TreeView nodes={nodes} />);

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});

describe('data-slot attributes', () => {
  it('renders data-slot="tree-view" on the tree list', () => {
    const nodes: TreeViewNode[] = [{ id: '1', label: 'Item' }];
    const { container } = render(<TreeView nodes={nodes} />);

    expect(container.querySelector('[data-slot="tree-view"]')).toBeInTheDocument();
  });

  it('renders data-slot="tree-item" on leaf nodes', () => {
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Item 1' },
      { id: '2', label: 'Item 2' },
    ];
    const { container } = render(<TreeView nodes={nodes} />);

    expect(container.querySelectorAll('[data-slot="tree-item"]')).toHaveLength(2);
  });

  it('renders data-slot="tree-branch" on expandable nodes', () => {
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Branch', collapsible: true, content: <span>Content</span> },
    ];
    const { container } = render(<TreeView nodes={nodes} />);

    expect(container.querySelector('[data-slot="tree-branch"]')).toBeInTheDocument();
  });
});

describe('data-testid', () => {
  it('forwards data-testid to the tree list', () => {
    const nodes: TreeViewNode[] = [{ id: '1', label: 'Item' }];
    render(<TreeView data-testid='my-tree-view' nodes={nodes} />);

    expect(screen.getByTestId('my-tree-view')).toBeInTheDocument();
  });

  it('does not render data-testid when none is provided', () => {
    const nodes: TreeViewNode[] = [{ id: '1', label: 'Item' }];
    const { container } = render(<TreeView nodes={nodes} />);

    const root = container.querySelector('[data-slot="tree-view"]');
    expect(root).not.toHaveAttribute('data-testid');
  });
});

describe('Expand/collapse', () => {
  it('expands all branches by default', () => {
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Branch', collapsible: true, content: <span>Content</span> },
    ];

    render(<TreeView nodes={nodes} />);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('respects defaultExpandedValue', () => {
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Open', collapsible: true, content: <span>Visible</span> },
      { id: '2', label: 'Closed', collapsible: true, content: <span>Hidden</span> },
    ];

    render(<TreeView nodes={nodes} defaultExpandedValue={['1']} />);

    // Open branch: content is visible
    expect(screen.getByText('Visible')).toBeInTheDocument();
    // Closed branch: content element exists but is hidden
    const hiddenEl = screen.getByText('Hidden');
    expect(hiddenEl.closest('[data-slot="tree-branch-content"]')).toHaveAttribute('hidden');
  });

  it('toggles branch on click', async () => {
    const onExpandedChange = vi.fn();
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Branch', collapsible: true, content: <span>Content</span> },
    ];

    const { container } = render(<TreeView nodes={nodes} onExpandedChange={onExpandedChange} />);

    const control = container.querySelector('[data-slot="tree-branch-control"]') as HTMLElement;
    await userEvent.click(control);
    expect(onExpandedChange).toHaveBeenCalled();
  });

  it('calls onExpandedChange when toggled', async () => {
    const onExpandedChange = vi.fn();
    const nodes: TreeViewNode[] = [
      { id: '1', label: 'Branch', collapsible: true, content: <span>Content</span> },
    ];

    const { container } = render(<TreeView nodes={nodes} onExpandedChange={onExpandedChange} />);

    const control = container.querySelector('[data-slot="tree-branch-control"]') as HTMLElement;
    await userEvent.click(control);
    expect(onExpandedChange).toHaveBeenCalled();
  });
});

describe('Action slot', () => {
  it('renders action in branch nodes', () => {
    const nodes: TreeViewNode[] = [
      {
        id: '1',
        label: 'Branch',
        action: <button type='button'>Copy</button>,
        collapsible: true,
        content: <span>Content</span>,
      },
    ];

    render(<TreeView nodes={nodes} />);

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders action in leaf nodes', () => {
    const nodes: TreeViewNode[] = [
      {
        id: '1',
        label: 'Leaf',
        action: <span>Action</span>,
      },
    ];

    render(<TreeView nodes={nodes} />);

    const actionSlot = screen.getByText('Action').closest('[data-slot="tree-view-action"]');
    expect(actionSlot).toBeInTheDocument();
  });
});

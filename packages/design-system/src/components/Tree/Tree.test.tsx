import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tree } from './Tree';
import { TreeItem } from './TreeItem';
import { TreeItemContent } from './TreeItemContent';
import { TreeItemHeader } from './TreeItemHeader';

describe('Node rendering', () => {
  it('renders leaf items', () => {
    render(
      <Tree>
        <TreeItem>
          <TreeItemHeader>Item 1</TreeItemHeader>
        </TreeItem>
        <TreeItem>
          <TreeItemHeader>Item 2</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders collapsible items with content', () => {
    render(
      <Tree>
        <TreeItem collapsible>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Hidden content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByText('Branch')).toBeInTheDocument();
    expect(screen.getByText('Hidden content')).toBeInTheDocument();
  });

  it('renders nested trees', () => {
    render(
      <Tree>
        <TreeItem>
          <TreeItemHeader>Parent</TreeItemHeader>
          <Tree>
            <TreeItem>
              <TreeItemHeader>Child</TreeItemHeader>
            </TreeItem>
          </Tree>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});

describe('data-slot attributes', () => {
  it('renders data-slot="tree" on the root', () => {
    const { container } = render(
      <Tree>
        <TreeItem>
          <TreeItemHeader>Item</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(container.querySelector('[data-slot="tree"]')).toBeInTheDocument();
  });

  it('renders data-slot="tree-item" on items', () => {
    const { container } = render(
      <Tree>
        <TreeItem>
          <TreeItemHeader>Item 1</TreeItemHeader>
        </TreeItem>
        <TreeItem>
          <TreeItemHeader>Item 2</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(container.querySelectorAll('[data-slot="tree-item"]')).toHaveLength(2);
  });

  it('renders data-slot="tree-item-header" on headers', () => {
    const { container } = render(
      <Tree>
        <TreeItem>
          <TreeItemHeader>Header</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(container.querySelector('[data-slot="tree-item-header"]')).toBeInTheDocument();
  });

  it('renders data-slot="tree-item-content" on content', () => {
    const { container } = render(
      <Tree>
        <TreeItem collapsible>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    expect(container.querySelector('[data-slot="tree-item-content"]')).toBeInTheDocument();
  });
});

describe('data-testid', () => {
  it('forwards data-testid to the tree root', () => {
    render(
      <Tree data-testid='my-tree'>
        <TreeItem>
          <TreeItemHeader>Item</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByTestId('my-tree')).toBeInTheDocument();
  });

  it('cascades data-testid to sub-components', () => {
    const { container } = render(
      <Tree data-testid='my-tree'>
        <TreeItem>
          <TreeItemHeader>Item</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(container.querySelector('[data-testid="my-tree--item"]')).toBeInTheDocument();
  });

  it('does not render data-testid when none is provided', () => {
    const { container } = render(
      <Tree>
        <TreeItem>
          <TreeItemHeader>Item</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    const root = container.querySelector('[data-slot="tree"]');
    expect(root).not.toHaveAttribute('data-testid');
  });
});

describe('Expand/collapse', () => {
  it('shows content when defaultOpen is true', () => {
    render(
      <Tree>
        <TreeItem collapsible defaultOpen>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    const content = screen.getByText('Content').closest('[data-slot="tree-item-content"]');
    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('hides content when defaultOpen is false', () => {
    const { container } = render(
      <Tree>
        <TreeItem collapsible defaultOpen={false}>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    const content = container.querySelector('[data-slot="tree-item-content"]');
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('toggles on header click', async () => {
    const { container } = render(
      <Tree>
        <TreeItem collapsible>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    const trigger = container.querySelector('[data-slot="tree-item-header"] button') as HTMLElement;
    const content = container.querySelector('[data-slot="tree-item-content"]') as HTMLElement;

    expect(content).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('calls onOpenChange when toggled', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Tree>
        <TreeItem collapsible onOpenChange={onOpenChange}>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    const trigger = container.querySelector('[data-slot="tree-item-header"] button') as HTMLElement;
    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Action slot', () => {
  it('renders action in collapsible headers', () => {
    render(
      <Tree>
        <TreeItem collapsible>
          <TreeItemHeader action={<button type='button'>Copy</button>}>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders action in non-collapsible headers', () => {
    render(
      <Tree>
        <TreeItem>
          <TreeItemHeader action={<span>Action</span>}>Leaf</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    const actionSlot = screen.getByText('Action').closest('[data-slot="tree-item-action"]');
    expect(actionSlot).toBeInTheDocument();
  });
});

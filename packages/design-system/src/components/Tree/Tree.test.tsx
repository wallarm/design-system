import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

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

    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

describe('Expand/collapse', () => {
  it('shows content when defaultOpen is true', () => {
    render(
      <Tree data-testid='tree'>
        <TreeItem collapsible defaultOpen>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('tree--content')).toHaveAttribute('data-state', 'open');
  });

  it('hides content when defaultOpen is false', () => {
    render(
      <Tree data-testid='tree'>
        <TreeItem collapsible defaultOpen={false}>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByTestId('tree--content')).toHaveAttribute('data-state', 'closed');
  });

  it('toggles on header click', async () => {
    render(
      <Tree data-testid='tree'>
        <TreeItem collapsible>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    const trigger = within(screen.getByTestId('tree--header')).getByRole('button');
    const content = screen.getByTestId('tree--content');

    expect(content).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('calls onOpenChange when toggled', async () => {
    const onOpenChange = rs.fn();
    render(
      <Tree data-testid='tree'>
        <TreeItem collapsible onOpenChange={onOpenChange}>
          <TreeItemHeader>Branch</TreeItemHeader>
          <TreeItemContent>
            <span>Content</span>
          </TreeItemContent>
        </TreeItem>
      </Tree>,
    );

    const trigger = within(screen.getByTestId('tree--header')).getByRole('button');
    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Action slot', () => {
  it('renders action in collapsible headers', () => {
    render(
      <Tree data-testid='tree'>
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
      <Tree data-testid='tree'>
        <TreeItem>
          <TreeItemHeader action={<span>Action</span>}>Leaf</TreeItemHeader>
        </TreeItem>
      </Tree>,
    );

    expect(screen.getByTestId('tree--action')).toHaveTextContent('Action');
  });
});

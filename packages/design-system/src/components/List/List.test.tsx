import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { List } from './List';
import { ListIcon } from './ListIcon';
import { ListItem } from './ListItem';

const renderList = () =>
  render(
    <List data-testid='lst'>
      <ListItem>
        <ListIcon>*</ListIcon>
        First item
      </ListItem>
    </List>,
  );

describe('List data-testid cascade', () => {
  it('derives every sub-component testid from the root', () => {
    renderList();

    expect(screen.getByTestId('lst')).toBeInTheDocument();
    expect(screen.getByTestId('lst--item')).toBeInTheDocument();
    expect(screen.getByTestId('lst--item--icon')).toBeInTheDocument();
  });

  it('renders no data-testid attributes when the root has none', () => {
    render(
      <List>
        <ListItem>
          <ListIcon>*</ListIcon>
          Item
        </ListItem>
      </List>,
    );

    expect(document.querySelector('[data-testid]')).toBeNull();
  });
});

describe('List semantics', () => {
  it('exposes list/listitem roles', () => {
    renderList();
    expect(screen.getByRole('list')).toBe(screen.getByTestId('lst'));
    expect(screen.getByRole('listitem')).toBe(screen.getByTestId('lst--item'));
  });

  it('renders as <ul> by default', () => {
    renderList();
    expect(screen.getByRole('list').tagName).toBe('UL');
  });

  it('renders as <ol> when variant is ordered', () => {
    render(
      <List data-testid='ol' variant='ordered'>
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(screen.getByTestId('ol').tagName).toBe('OL');
  });
});

describe('List data-slot', () => {
  it('sets the expected data-slot on every sub-component root element', () => {
    renderList();

    expect(screen.getByTestId('lst')).toHaveAttribute('data-slot', 'list');
    expect(screen.getByTestId('lst--item')).toHaveAttribute('data-slot', 'list-item');
    expect(screen.getByTestId('lst--item--icon')).toHaveAttribute('data-slot', 'list-icon');
  });
});

describe('List marker variants', () => {
  it('applies list-disc and pl-24 when marker is disc', () => {
    render(
      <List data-testid='disc' marker='disc'>
        <ListItem>Item</ListItem>
      </List>,
    );
    const el = screen.getByTestId('disc');
    expect(el.className).toContain('list-disc');
    expect(el.className).toContain('pl-24');
  });

  it('applies list-decimal and pl-24 when marker is decimal', () => {
    render(
      <List data-testid='decimal' marker='decimal'>
        <ListItem>Item</ListItem>
      </List>,
    );
    const el = screen.getByTestId('decimal');
    expect(el.className).toContain('list-decimal');
    expect(el.className).toContain('pl-24');
  });

  it('applies list-none by default', () => {
    renderList();
    expect(screen.getByTestId('lst').className).toContain('list-none');
  });
});

describe('List with multiple items', () => {
  const renderMultipleItems = () =>
    render(
      <List data-testid='lst'>
        <ListItem>First</ListItem>
        <ListItem>Second</ListItem>
        <ListItem>Third</ListItem>
      </List>,
    );

  it('renders one <li> per item, all sharing the same flat testid', () => {
    renderMultipleItems();
    expect(screen.getAllByTestId('lst--item')).toHaveLength(3);
  });

  it('marks only the actual last item as :last-child', () => {
    renderMultipleItems();
    const items = screen.getAllByTestId('lst--item');
    const list = screen.getByRole('list');
    expect(list.lastElementChild).toBe(items[items.length - 1]);
  });
});

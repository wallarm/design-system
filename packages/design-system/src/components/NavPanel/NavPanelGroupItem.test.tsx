import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NavPanelDepthProvider } from './NavPanelContext';
import { NavPanelGroupItem } from './NavPanelGroupItem';

const renderItem = ({ depth, active }: { depth: number; active: boolean }) =>
  render(
    <NavPanelDepthProvider value={{ depth, indent: 24 }}>
      <NavPanelGroupItem href='#' active={active}>
        Item
      </NavPanelGroupItem>
    </NavPanelDepthProvider>,
  );

const getSegment = () => screen.getByRole('link').querySelector(':scope > [aria-hidden="true"]');

describe('NavPanelGroupItem tree line', () => {
  it('draws its own segment over the group line when active and nested', () => {
    renderItem({ depth: 1, active: true });

    const segment = getSegment();
    expect(segment).not.toBeNull();
    // Same x as NavPanelGroupContent's line: 24 * 1 - 8.
    expect(segment).toHaveStyle({ left: '16px' });
    expect(segment).toHaveClass('hidden', 'branded:block', 'bg-border-brand');
  });

  it('follows the depth for deeper items', () => {
    renderItem({ depth: 2, active: true });

    expect(getSegment()).toHaveStyle({ left: '40px' });
  });

  it('draws no segment when the item is not active', () => {
    renderItem({ depth: 1, active: false });

    expect(getSegment()).toBeNull();
  });

  it('draws no segment at the top level, where there is no tree line', () => {
    renderItem({ depth: 0, active: true });

    expect(getSegment()).toBeNull();
  });
});

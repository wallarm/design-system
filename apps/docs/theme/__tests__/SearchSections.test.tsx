import { describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import nav from '../../docs/_nav.json';
import { SearchSections, SearchSectionsHost } from '../SearchSections';

rs.mock('@rspress/core/runtime', () => ({
  withBase: (path: string) => `/design-system${path}`,
}));
rs.mock('@rspress/core/theme-original', () => ({
  Link: (props: Record<string, unknown>) => <a {...props} />,
  SvgWrapper: () => null,
  IconJump: {},
  IconTitle: {},
}));

describe('SearchSections', () => {
  it('lists the navbar sections in order', () => {
    render(<SearchSections onNavigate={() => undefined} />);
    const links = screen.getAllByRole('link');
    expect(links.map(l => l.querySelector('.rp-suggest-item__statement')?.textContent)).toEqual(
      nav.map(n => n.text),
    );
    expect(links).toHaveLength(6);
    expect(links[1]?.getAttribute('href')).toBe('/design-system/ai/mcp');
  });

  it('opens Storybook externally', () => {
    render(<SearchSections onNavigate={() => undefined} />);
    const storybook = screen.getByRole('link', { name: /Storybook/ });
    expect(storybook.getAttribute('href')).toBe(
      'https://wallarm.github.io/design-system/storybook/',
    );
    expect(storybook.getAttribute('target')).toBe('_blank');
    expect(storybook.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('moves the active item with arrows and opens it on Enter', () => {
    const onNavigate = rs.fn();
    render(<SearchSections onNavigate={onNavigate} />);
    const input = document.createElement('input');
    input.className = 'rp-search-panel__input';
    document.body.append(input);
    const items = () => [...document.querySelectorAll('.rp-suggest-item')];
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    });
    expect(items()[1]?.className).toContain('--current');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    input.remove();
  });

  it('reports navigation so the dialog can close', () => {
    const onNavigate = rs.fn();
    render(<SearchSections onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('link', { name: /^AI/ }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe('SearchSectionsHost', () => {
  const mountModal = () => {
    const modal = document.createElement('div');
    modal.className = 'rp-search-panel__modal';
    modal.innerHTML = '<div class="rp-search-panel__header"></div><div class="results"></div>';
    act(() => {
      document.body.append(modal);
    });
    return modal;
  };

  it('follows the modal as it mounts late and re-mounts, placed between header and results', async () => {
    render(<SearchSectionsHost />);
    expect(screen.queryByRole('navigation')).toBeNull();

    const first = mountModal();
    await waitFor(() => expect(first.querySelectorAll('a')).toHaveLength(6));
    const order = [...first.children].map(c => c.className || c.tagName);
    expect(order.indexOf('rp-search-panel__header')).toBeLessThan(order.indexOf('DIV'));
    expect(first.children[1]?.querySelector('nav')).not.toBeNull();
    expect(first.children[2]?.className).toBe('results');

    act(() => first.remove());
    await waitFor(() => expect(screen.queryByRole('navigation')).toBeNull());

    const second = mountModal();
    await waitFor(() => expect(second.querySelectorAll('a')).toHaveLength(6));
    act(() => second.remove());
  });
});

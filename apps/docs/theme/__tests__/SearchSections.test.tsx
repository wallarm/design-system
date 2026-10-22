import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import nav from '../../docs/_nav.json';
import { SearchSections } from '../SearchSections';

rs.mock('@rspress/core/runtime', () => ({
  withBase: (path: string) => `/design-system${path}`,
}));
rs.mock('@rspress/core/theme-original', () => ({
  Link: (props: Record<string, unknown>) => <a {...props} />,
}));

describe('SearchSections', () => {
  it('lists the navbar sections in order', () => {
    render(<SearchSections onNavigate={() => undefined} />);
    const links = screen.getAllByRole('link');
    expect(links.map(l => l.textContent)).toEqual(nav.map(n => n.text));
    expect(links).toHaveLength(6);
    expect(links[1]?.getAttribute('href')).toBe('/design-system/ai/mcp');
  });

  it('opens Storybook externally', () => {
    render(<SearchSections onNavigate={() => undefined} />);
    const storybook = screen.getByRole('link', { name: 'Storybook' });
    expect(storybook.getAttribute('href')).toBe(
      'https://wallarm.github.io/design-system/storybook/',
    );
    expect(storybook.getAttribute('target')).toBe('_blank');
    expect(storybook.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('reports navigation so the dialog can close', () => {
    const onNavigate = rs.fn();
    render(<SearchSections onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('link', { name: 'AI' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

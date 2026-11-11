import type { ComponentProps } from 'react';

import type { SidebarData } from '@rspress/core';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { overviewGroups, SectionOverview } from '../SectionOverview';

const sidebar: SidebarData = [
  { text: 'Overview', link: '/components/index' },
  {
    text: 'Actions',
    collapsible: true,
    collapsed: false,
    items: [
      { text: 'Button', link: '/components/button' },
      { text: 'SplitButton', link: '/components/split-button', tag: 'new' },
    ],
  },
  { dividerType: 'solid' },
  { text: 'Card', link: '/components/card' },
];

const pages = [
  { routePath: '/components/button', frontmatter: { description: 'Triggers an action.' } },
  { routePath: '/components/card', frontmatter: {} },
];

// Paths compare like Rspress's isEqualPath: `/x/index` is `/x/`.
rs.mock('@rspress/core/runtime', () => ({
  isEqualPath: (a: string, b: string) => a.replace(/index$/, '') === b.replace(/index$/, ''),
  usePage: () => ({ page: { routePath: '/components/' } }),
  usePages: () => ({ pages }),
  useSidebar: () => sidebar,
  withBase: (url: string) => `/design-system${url}`,
  routePathToMdPath: (url: string) => `/design-system${url}.md`,
  withSiteOrigin: (url: string) => `https://example.com${url}`,
}));

rs.mock('@rspress/core/theme-original', () => ({
  Link: ({ children, ...props }: ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

afterEach(() => {
  rs.unstubAllEnvs();
});

describe('overviewGroups', () => {
  it('groups by linkless sidebar group, skips the overview itself and reads descriptions', () => {
    expect(overviewGroups(sidebar, pages, '/components/')).toEqual([
      {
        title: 'Actions',
        cards: [
          {
            title: 'Button',
            link: '/components/button',
            description: 'Triggers an action.',
            tag: undefined,
          },
          { title: 'SplitButton', link: '/components/split-button', description: '', tag: 'new' },
        ],
      },
      { cards: [{ title: 'Card', link: '/components/card', description: '', tag: undefined }] },
    ]);
  });
});

describe('SectionOverview', () => {
  it('renders headings and linked list items in markdown output', () => {
    rs.stubEnv('SSG_MD', 'true');
    const { container } = render(<SectionOverview />);
    expect(container.innerHTML).toBe(
      '<h2>Actions</h2><ul><li><a href="https://example.com/design-system/components/button.md">Button</a>: Triggers an action.</li><li><a href="https://example.com/design-system/components/split-button.md">SplitButton</a></li></ul><ul><li><a href="https://example.com/design-system/components/card.md">Card</a></li></ul>',
    );
  });

  it('renders a card per page, each one link, with its tag', () => {
    render(<SectionOverview />);
    expect(screen.getByRole('heading', { level: 2, name: 'Actions' })).toBeTruthy();
    expect(screen.getAllByRole('link').map(a => a.getAttribute('href'))).toEqual([
      '/design-system/components/button',
      '/design-system/components/split-button',
      '/design-system/components/card',
    ]);
    expect(screen.getByText('new')).toBeTruthy();
  });
});

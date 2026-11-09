import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render } from '@testing-library/react';
import { TemplateGallery } from '../TemplateGallery';

rs.mock('@rspress/core/runtime', () => ({
  withBase: (url: string) => `/design-system${url}`,
  routePathToMdPath: (url: string) => `/design-system${url}.md`,
  withSiteOrigin: (url: string) => `https://example.com${url}`,
  usePage: () => ({ page: { routePath: '/', title: '' } }),
}));

rs.mock('@rspress/core/theme-original', () => ({
  Link: (props: ComponentProps<'a'>) => <a {...props} />,
}));

afterEach(() => {
  rs.unstubAllEnvs();
  rs.unstubAllGlobals();
});

const never = () =>
  new Promise<Record<string, unknown>>(() => {
    // never resolves: neither output may need the story
  });

const stubResizeObserver = () =>
  rs.stubGlobal(
    'ResizeObserver',
    class {
      observe() {
        // the thumbnail stays a skeleton
      }
      disconnect() {
        // nothing to release
      }
    },
  );

const templates = [
  {
    slug: 'templates/security-dashboard',
    title: 'Security dashboard',
    description: 'Use when building the overview.',
    link: '/templates/security-dashboard',
    load: never,
    stories: ['Default', 'Loading', 'NoData'],
  },
];

describe('TemplateGallery', () => {
  it('renders a plain list of links in markdown output', () => {
    rs.stubEnv('SSG_MD', 'true');
    const { container } = render(<TemplateGallery templates={templates} />);
    expect(container.innerHTML).toBe(
      '<ul><li><a href="https://example.com/design-system/templates/security-dashboard.md">Security dashboard</a>: Use when building the overview.</li></ul>',
    );
  });

  it('renders a card that previews the template and links its docs page', () => {
    stubResizeObserver();
    const { getByRole } = render(<TemplateGallery templates={templates} />);
    expect(getByRole('button', { name: 'Preview Security dashboard' })).toBeTruthy();
    expect(getByRole('link', { name: 'Read the docs' }).getAttribute('href')).toBe(
      '/design-system/templates/security-dashboard',
    );
    expect(getByRole('listitem').textContent).toContain('3 states');
  });
});

import { type FC, type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Page, PageContent, PageHeader, PageTitle } from '../../Page';
import {
  type NavConfig,
  RemoteShell,
  RemoteShellBreadcrumb,
  RemoteShellContent,
  RemoteShellPanel,
  useRemoteShellContext,
} from '../../RemoteShell';
import { HomeContent } from './_storyHomeContent';
import { PRODUCT_CONFIGS, type Product } from './_storyLib';
import { useStoryPathname } from './_storyRouter';

export interface ConfigRemoteProps {
  config: NavConfig;
  basePath?: string;
  /** Fake a 2s load when the product opens, to show the panel and content skeletons. */
  simulateLoading?: boolean;
  /** Page content; defaults to a placeholder page titled after the breadcrumbs. */
  children?: ReactNode;
}

const RemotePageContent: FC = () => {
  const { breadcrumbSegments } = useRemoteShellContext();

  const lastSegment = breadcrumbSegments[breadcrumbSegments.length - 1];
  const pageTitle = lastSegment?.label ?? '';
  const fullPath = breadcrumbSegments.map(s => s.label).join(' / ');

  return (
    <Page title={pageTitle} fixedHeight>
      <PageHeader>
        <PageTitle>{pageTitle}</PageTitle>
      </PageHeader>
      <PageContent>
        <p className='text-sm text-text-secondary'>Placeholder page for {fullPath}.</p>
      </PageContent>
    </Page>
  );
};

/**
 * A product remote wired to TanStack Router the recommended way: the router owns the
 * URL, `RemoteShell` gets the router's pathname (`pathname`) and hands navigations
 * back to it (`onNavigate`). Must render inside a router (`StoryRouter`).
 */
export const ConfigRemote: FC<ConfigRemoteProps> = ({
  config,
  basePath,
  simulateLoading = true,
  children,
}) => {
  const navigate = useNavigate();
  const pathname = useStoryPathname();
  const [loading, setLoading] = useState(simulateLoading);

  // Remounted per product (see `RemoteForProduct`), so this runs once per product.
  useEffect(() => {
    if (!simulateLoading) return;
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [simulateLoading]);

  return (
    <RemoteShell
      config={config}
      basePath={basePath}
      pathname={pathname}
      onNavigate={to => navigate({ to })}
    >
      {loading ? (
        <>
          <RemoteShellPanel isLoading />
          <RemoteShellContent isLoading />
        </>
      ) : (
        <>
          <RemoteShellPanel resizable />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>{children ?? <RemotePageContent />}</RemoteShellContent>
        </>
      )}
    </RemoteShell>
  );
};

export const RemoteForProduct = ({
  product,
  simulateLoading = true,
}: {
  product: Product;
  simulateLoading?: boolean;
}) => {
  if (product === 'home') return <HomeContent />;
  const { config } = PRODUCT_CONFIGS[product];
  // Keyed by product: each product is its own remote, so its drill-transition and
  // loading state never carry over to the next one.
  return (
    <ConfigRemote
      key={product}
      config={config}
      basePath={`/${product}`}
      simulateLoading={simulateLoading}
    />
  );
};

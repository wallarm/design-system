import { type FC, useEffect, useState } from 'react';
import { NavPanel, NavPanelHeader } from '../../NavPanel';
import { Page, PageContent, PageHeader, PageTitle } from '../../Page';
import {
  type NavConfig,
  NavPanelSkeleton,
  ProductNav,
  ProductNavBreadcrumbs,
  ProductNavPanel,
  useProductNavContext,
} from '../../ProductNav';
import {
  RemoteShell,
  RemoteShellBreadcrumb,
  RemoteShellContent,
  RemoteShellPanel,
} from '../../RemoteShell';
import { HomeContent } from './_storyHomeContent';
import { PRODUCT_CONFIGS, type Product } from './_storyLib';

export interface ConfigRemoteProps {
  config: NavConfig;
  basePath?: string;
}

const RemotePageContent: FC = () => {
  const { breadcrumbSegments } = useProductNavContext();

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

const ConfigRemote: FC<ConfigRemoteProps> = ({ config, basePath }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [config.productLabel]);

  if (loading)
    return (
      <RemoteShell>
        <RemoteShellPanel>
          <NavPanel>
            <NavPanelHeader>{config.productLabel}</NavPanelHeader>
            <NavPanelSkeleton count={6} />
          </NavPanel>
        </RemoteShellPanel>
        <RemoteShellContent />
      </RemoteShell>
    );

  return (
    <ProductNav config={config} basePath={basePath}>
      <RemoteShell>
        <RemoteShellPanel>
          <ProductNavPanel resizable />
        </RemoteShellPanel>
        <RemoteShellBreadcrumb>
          <ProductNavBreadcrumbs />
        </RemoteShellBreadcrumb>
        <RemoteShellContent>
          <RemotePageContent />
        </RemoteShellContent>
      </RemoteShell>
    </ProductNav>
  );
};

export const RemoteForProduct = ({ product }: { product: Product }) => {
  if (product === 'home') return <HomeContent />;
  const { config } = PRODUCT_CONFIGS[product];
  return <ConfigRemote config={config} basePath={`/${product}`} />;
};

import { type FC, useEffect, useState } from 'react';
import { NavPanel, NavPanelHeader } from '../../NavPanel';
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

const PageContent: FC = () => {
  const { config, breadcrumbSegments } = useProductNavContext();

  const lastSegment = breadcrumbSegments[breadcrumbSegments.length - 1];
  const pageTitle = lastSegment?.label ?? config.productLabel;

  return (
    <>
      <h1 className='text-xl font-semibold text-text-primary'>{pageTitle}</h1>
      <p className='mt-8 text-sm text-text-secondary'>
        Placeholder page for {config.productLabel} / {pageTitle}.
      </p>
    </>
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
          <PageContent />
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

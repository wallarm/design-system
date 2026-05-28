import { type FC, useEffect, useState } from 'react';
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

export interface ConfigRemoteProps {
  config: NavConfig;
  basePath?: string;
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

const ConfigRemote: FC<ConfigRemoteProps> = ({ config, basePath }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [config.productLabel]);

  return (
    <RemoteShell config={config} basePath={basePath}>
      {loading ? (
        <>
          <RemoteShellPanel isLoading />
          <RemoteShellContent isLoading />
        </>
      ) : (
        <>
          <RemoteShellPanel resizable />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <RemotePageContent />
          </RemoteShellContent>
        </>
      )}
    </RemoteShell>
  );
};

export const RemoteForProduct = ({ product }: { product: Product }) => {
  if (product === 'home') return <HomeContent />;
  const { config } = PRODUCT_CONFIGS[product];
  return <ConfigRemote config={config} basePath={`/${product}`} />;
};

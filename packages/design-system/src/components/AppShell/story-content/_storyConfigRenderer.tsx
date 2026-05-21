import type { FC } from 'react';
import type { NavConfig } from '../../ProductNav';
import {
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

export const ConfigRemote: FC<ConfigRemoteProps> = ({ config, basePath }) => (
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

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { usePageHost } from './PageHostContext';

export interface PageProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  name?: string;
  title?: string;
  fullSize?: boolean;
  fixedHeight?: boolean;
  children?: ReactNode;
}

/**
 * @example
 * ```tsx
 * <Page name="api-attack-surface" fullSize fixedHeight>
 *   <PageHeader>
 *     <PageTitle>API Attack Surface</PageTitle>
 *     <PageActions>***</PageActions>
 *   </PageHeader>
 *   <PageContent>{children}</PageContent>
 * </Page>
 * ```
 */
export const Page: FC<PageProps> = ({
  ref,
  name,
  title,
  fullSize,
  fixedHeight,
  children,
  className,
  'data-testid': testId,
  ...props
}) => {
  const host = usePageHost();

  useEffect(() => {
    host?.setLayout({ name, fullSize, fixedHeight });
  }, [host, name, fullSize, fixedHeight]);

  return (
    <TestIdProvider value={testId}>
      {title && <title>{title}</title>}

      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='page'
        className={cn('flex flex-col', fixedHeight && 'h-full', className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

Page.displayName = 'Page';

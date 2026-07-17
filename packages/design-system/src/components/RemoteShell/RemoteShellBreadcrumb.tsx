import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Breadcrumbs, BreadcrumbsItem, BreadcrumbsScopeSwitcher } from '../Breadcrumbs';
import { useRemoteShellContext } from './model';

export interface RemoteShellBreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const RemoteShellBreadcrumb: FC<RemoteShellBreadcrumbProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('breadcrumb');
  const { breadcrumbSegments, navigateTo } = useRemoteShellContext();

  return (
    <div
      {...props}
      ref={ref}
      data-slot='remote-shell-breadcrumb'
      data-testid={testId}
      className={cn('[grid-area:breadcrumb] flex items-center gap-8 px-16 py-8', className)}
    >
      <Breadcrumbs data-slot='nav-breadcrumbs' className='-ml-4'>
        {breadcrumbSegments.map((segment, i) => {
          const isLast = i === breadcrumbSegments.length - 1;

          if (segment.type === 'scope-switcher') {
            if (segment.scopeItems?.length && segment.paramValue) {
              return (
                <BreadcrumbsScopeSwitcher
                  key={i}
                  value={segment.paramValue}
                  items={segment.scopeItems}
                  onSelect={item => navigateTo?.(item.href)}
                >
                  {segment.label}
                </BreadcrumbsScopeSwitcher>
              );
            }

            return <BreadcrumbsItem key={i}>{segment.label}</BreadcrumbsItem>;
          }

          if (segment.type === 'link' && !isLast) {
            return (
              <BreadcrumbsItem
                key={i}
                href={segment.href}
                onClick={e => {
                  if (navigateTo && segment.href) {
                    e.preventDefault();
                    navigateTo(segment.href);
                  }
                }}
              >
                {segment.label}
              </BreadcrumbsItem>
            );
          }

          return <BreadcrumbsItem key={i}>{segment.label}</BreadcrumbsItem>;
        })}
      </Breadcrumbs>

      {children}
    </div>
  );
};

RemoteShellBreadcrumb.displayName = 'RemoteShellBreadcrumb';

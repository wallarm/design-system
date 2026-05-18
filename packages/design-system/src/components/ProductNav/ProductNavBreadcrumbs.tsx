import type { FC } from 'react';
import { Breadcrumbs, BreadcrumbsItem, BreadcrumbsScopeSwitcher } from '../Breadcrumbs';
import { useProductNavContext } from './ProductNavContext';

export const ProductNavBreadcrumbs: FC = () => {
  const { breadcrumbSegments, navigateTo } = useProductNavContext();

  return (
    <Breadcrumbs data-slot='nav-breadcrumbs'>
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
  );
};

ProductNavBreadcrumbs.displayName = 'ProductNavBreadcrumbs';

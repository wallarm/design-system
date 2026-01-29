import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

import { cn } from '../../utils/cn';

import { BreadcrumbsSeparator } from './BreadcrumbsSeparator';

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
  /** Additional CSS classes */
  className?: string;
  /** Child breadcrumb items and separators */
  children?: ReactNode;
};

/**
 * Breadcrumbs component for showing navigation hierarchy.
 *
 * Used to show the user's location within a website or application and allow
 * easy navigation back to parent pages.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <BreadcrumbsItem href="/home">
 *     <Home size="md" />
 *     Home
 *   </BreadcrumbsItem>
 *   <BreadcrumbsItem href="/products">Products</BreadcrumbsItem>
 *   <BreadcrumbsItem current>Current Page</BreadcrumbsItem>
 * </Breadcrumbs>
 * ```
 */
let separatorId = 0;

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
  className,
  children,
  ...props
}) => {
  const childrenArray = Children.toArray(children);
  const childrenWithSeparators: ReactNode[] = [];

  childrenArray.forEach((child, index) => {
    const isLastItem = index === childrenArray.length - 1;

    const clonedChild = isValidElement(child)
      ? cloneElement(child, { isCurrent: isLastItem } as Record<
          string,
          unknown
        >)
      : child;

    childrenWithSeparators.push(clonedChild);

    if (index < childrenArray.length - 1) {
      /**
       * @todo Should be fixed
       */
      // eslint-disable-next-line react-hooks/globals
      separatorId += 1;
      childrenWithSeparators.push(
        <BreadcrumbsSeparator key={`separator-${separatorId}`} />,
      );
    }
  });

  return (
    <nav
      className={cn('flex items-center', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center gap-0">{childrenWithSeparators}</ol>
    </nav>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';

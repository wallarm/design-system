import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { BreadcrumbsSeparator } from './BreadcrumbsSeparator';

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> &
  TestableProps & {
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
export const Breadcrumbs: FC<BreadcrumbsProps> = ({
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const childrenArray = Children.toArray(children);
  const childrenWithSeparators: ReactNode[] = [];

  childrenArray.forEach((child, index) => {
    const isLastItem = index === childrenArray.length - 1;

    const clonedChild = isValidElement(child)
      ? cloneElement(child, { isCurrent: isLastItem } as Record<string, unknown>)
      : child;

    childrenWithSeparators.push(clonedChild);

    if (index < childrenArray.length - 1) {
      // Keyed by position: render stays pure (React Compiler skips components
      // that mutate module state) and separators keep a stable identity.
      // biome-ignore lint/suspicious/noArrayIndexKey: separators have no identity besides their position
      childrenWithSeparators.push(<BreadcrumbsSeparator key={`separator-${index}`} />);
    }
  });

  return (
    <TestIdProvider value={testId}>
      <nav
        className={cn('flex items-center', className)}
        aria-label='Breadcrumb'
        data-testid={testId}
        {...props}
      >
        <ol className='flex items-center gap-0'>{childrenWithSeparators}</ol>
      </nav>
    </TestIdProvider>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';

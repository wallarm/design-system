import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type BreadcrumbsSeparatorProps = HTMLAttributes<HTMLLIElement> & {
  ref?: Ref<HTMLLIElement>;
  /** Additional CSS classes */
  className?: string;
  /** Custom separator icon (defaults to ChevronRight) */
  children?: ReactNode;
};

/**
 * Separator component for breadcrumbs.
 *
 * Shows a visual separator (typically a chevron) between breadcrumb items
 * to indicate hierarchy direction.
 *
 * @example
 * ```tsx
 * <BreadcrumbsSeparator />
 * <BreadcrumbsSeparator>
 *   <CustomIcon />
 * </BreadcrumbsSeparator>
 * ```
 */
export const BreadcrumbsSeparator: FC<BreadcrumbsSeparatorProps> = ({
  className,
  children,
  ...props
}) => {
  const testId = useTestId('separator');

  return (
    <li
      className={cn('flex h-20 w-20 items-center justify-center', className)}
      aria-hidden='true'
      data-testid={testId}
      {...props}
    >
      {children || <ChevronRight size='md' className='text-icon-secondary' />}
    </li>
  );
};

BreadcrumbsSeparator.displayName = 'BreadcrumbsSeparator';

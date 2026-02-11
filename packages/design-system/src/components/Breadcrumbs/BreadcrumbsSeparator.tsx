import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';

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
  return (
    <li
      className={cn('flex items-center justify-center w-20 h-20', className)}
      aria-hidden='true'
      {...props}
    >
      {children || <ChevronRight size='md' className='text-icon-secondary' />}
    </li>
  );
};

BreadcrumbsSeparator.displayName = 'BreadcrumbsSeparator';

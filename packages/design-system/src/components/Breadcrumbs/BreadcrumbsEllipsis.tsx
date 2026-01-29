import type { ButtonHTMLAttributes, FC, Ref } from 'react';

import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';

export type BreadcrumbsEllipsisProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: Ref<HTMLButtonElement>;
    /** Additional CSS classes */
    className?: string;
  };

/**
 * Ellipsis component for truncated breadcrumbs.
 *
 * Used to indicate that there are hidden breadcrumb levels between
 * the visible ones. Can be clickable to reveal the hidden items.
 *
 * @example
 * ```tsx
 * <BreadcrumbsEllipsis onClick={showMoreItems} />
 * ```
 */
export const BreadcrumbsEllipsis: FC<BreadcrumbsEllipsisProps> = ({
  className,
  ...props
}) => {
  return (
    <li>
      <button
        type="button"
        className={cn(
          [
            'flex items-center gap-4 min-h-[20px] px-4 py-0 rounded-6',
            'text-sm leading-5 text-text-secondary transition-colors',
            'bg-transparent hover:bg-states-primary-hover active:bg-states-primary-pressed',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
            'cursor-pointer',
          ],
          className,
        )}
        aria-label="Show more breadcrumbs"
        {...props}
      >
        <Ellipsis size="md" />
      </button>
    </li>
  );
};

BreadcrumbsEllipsis.displayName = 'BreadcrumbsEllipsis';

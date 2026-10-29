import type { ButtonHTMLAttributes, FC, Ref } from 'react';

import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type BreadcrumbsEllipsisProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
export const BreadcrumbsEllipsis: FC<BreadcrumbsEllipsisProps> = ({ className, ...props }) => {
  const testId = useTestId('ellipsis');

  return (
    <li>
      <button
        type='button'
        className={cn(
          [
            'flex min-h-[20px] items-center gap-4 rounded-6 px-4 py-0',
            'text-sm leading-5 text-text-secondary transition-colors',
            'bg-transparent hover:bg-states-primary-hover active:bg-states-primary-pressed',
            'focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
            'cursor-pointer',
          ],
          className,
        )}
        aria-label='Show more breadcrumbs'
        data-testid={testId}
        {...props}
      >
        <Ellipsis size='md' />
      </button>
    </li>
  );
};

BreadcrumbsEllipsis.displayName = 'BreadcrumbsEllipsis';

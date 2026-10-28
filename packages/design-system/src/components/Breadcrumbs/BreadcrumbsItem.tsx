import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FC,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

const breadcrumbsItemVariants = cva(
  [
    'flex min-h-[20px] items-center gap-4 rounded-6 px-4 py-0',
    'font-sans-display text-sm whitespace-nowrap transition-colors',
    'focus-visible:ring-3 focus-visible:ring-focus-primary focus-visible:outline-none',
    'cursor-pointer',
  ],
  {
    variants: {
      isCurrent: {
        true: [
          'font-medium text-text-primary',
          'bg-transparent hover:bg-states-primary-hover active:bg-states-primary-pressed',
        ],
        false: [
          'font-normal text-text-secondary',
          'bg-transparent hover:bg-states-primary-hover active:bg-states-primary-pressed',
        ],
      },
    },
    defaultVariants: {
      isCurrent: false,
    },
  },
);

export type BreadcrumbsItemProps = Omit<
  VariantProps<typeof breadcrumbsItemVariants>,
  'isCurrent'
> & {
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>;
  /** Additional CSS classes */
  className?: string;
  /** If provided, renders as a link instead of button */
  href?: string;
  /** Child content (text, icons, etc.) */
  children?: ReactNode;
  /** Click handler for buttons */
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** @internal - Whether this is the current/active page (set automatically by parent) */
  isCurrent?: boolean;
};

/**
 * Individual breadcrumb item component.
 *
 * Represents a single level in the navigation hierarchy. Can be clickable
 * (for navigation) or static (for the current page).
 *
 * @example
 * ```tsx
 * <BreadcrumbsItem href="/products">Products</BreadcrumbsItem>
 * <BreadcrumbsItem onClick={() => alert('clicked')}>Interactive</BreadcrumbsItem>
 * <BreadcrumbsItem href="/home">
 *   <Home size="md" />
 *   Home
 * </BreadcrumbsItem>
 * ```
 */
export const BreadcrumbsItem: FC<BreadcrumbsItemProps> = ({
  className,
  isCurrent = false,
  href,
  children,
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const testId = useTestId('item');
  const isLink = href && !isCurrent;
  const isInteractive = !!href || !!onClick;

  const commonClasses = cn(
    breadcrumbsItemVariants({ isCurrent }),
    !isInteractive && 'cursor-default hover:bg-transparent active:bg-transparent',
    className,
  );

  return (
    <li>
      {isLink ? (
        <a
          href={href}
          onClick={onClick}
          className={commonClasses}
          aria-label={ariaLabel}
          data-testid={testId}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      ) : (
        <button
          type='button'
          onClick={onClick}
          className={commonClasses}
          aria-current={isCurrent ? ('page' as const) : undefined}
          tabIndex={0}
          aria-label={ariaLabel}
          data-testid={testId}
          {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      )}
    </li>
  );
};

BreadcrumbsItem.displayName = 'BreadcrumbsItem';

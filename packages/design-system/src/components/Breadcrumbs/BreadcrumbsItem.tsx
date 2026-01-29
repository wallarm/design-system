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

const breadcrumbsItemVariants = cva(
  [
    'flex items-center gap-4 min-h-[20px] px-4 py-0 rounded-6',
    'text-sm leading-5 whitespace-nowrap transition-colors font-sans-display',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    'cursor-pointer',
  ],
  {
    variants: {
      isCurrent: {
        true: [
          'text-text-primary font-medium',
          'bg-transparent hover:bg-states-primary-hover active:bg-states-primary-pressed',
        ],
        false: [
          'text-text-secondary font-normal',
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
  const isLink = href && !isCurrent;

  const commonClasses = cn(breadcrumbsItemVariants({ isCurrent }), className);

  return (
    <li>
      {isLink ? (
        <a
          href={href}
          className={commonClasses}
          aria-label={ariaLabel}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={commonClasses}
          aria-current={isCurrent ? ('page' as const) : undefined}
          tabIndex={0}
          aria-label={ariaLabel}
          {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      )}
    </li>
  );
};

BreadcrumbsItem.displayName = 'BreadcrumbsItem';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { BannerVariantProvider } from './BannerContext';
import { BannerIcon } from './BannerIcon';
import { type BannerVariant, bannerVariants } from './classes';

export type { BannerVariant };

export interface BannerProps
  extends Omit<VariantProps<typeof bannerVariants>, 'variant'>,
    HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Visual variant of the banner */
  variant?: BannerVariant;
  /**
   * Leading icon. The destructive, info, and warning variants render a default
   * icon when this is omitted; primary and secondary render none. Passing an
   * icon always overrides the default.
   */
  icon?: ReactNode;
  /** Banner content — compose with Banner sub-components */
  children?: ReactNode;
}

/**
 * Banner displays a prominent, full-width message at the top of the page
 * (above the header) to communicate system-wide status, announcements,
 * warnings, errors, or promotional messages to all users.
 *
 * Banners persist until dismissed by the user or until the state that caused
 * them is resolved.
 *
 * Supports 5 variants: primary (dark/neutral), secondary, destructive, info,
 * and warning. Compose with: BannerContent, BannerTitle, BannerDescription,
 * BannerLink, BannerControls, BannerClose.
 */
export const Banner: FC<BannerProps> = ({
  ref,
  variant = 'primary',
  icon,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <BannerVariantProvider value={variant}>
      <TestIdProvider value={testId}>
        <div
          {...props}
          ref={ref}
          role='status'
          data-slot='banner'
          data-testid={testId}
          data-variant={variant}
          className={cn(bannerVariants({ variant }), className)}
        >
          <BannerIcon icon={icon} />
          {children}
        </div>
      </TestIdProvider>
    </BannerVariantProvider>
  );
};

Banner.displayName = 'Banner';

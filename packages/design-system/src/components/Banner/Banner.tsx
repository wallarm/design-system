import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { BannerColorProvider } from './BannerContext';
import { type BannerColor, bannerVariants } from './classes';

export type { BannerColor };

export interface BannerProps
  extends Omit<VariantProps<typeof bannerVariants>, 'color'>,
    Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Color variant of the banner */
  color?: BannerColor;
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
 * Supports 5 color variants: primary (dark/neutral), secondary, destructive,
 * info, and warning. Compose with: BannerIcon, BannerContent, BannerTitle,
 * BannerDescription, BannerLink, BannerControls, BannerClose.
 */
export const Banner: FC<BannerProps> = ({
  ref,
  color = 'primary',
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <BannerColorProvider value={color}>
      <TestIdProvider value={testId}>
        <div
          {...props}
          ref={ref}
          role='status'
          data-slot='banner'
          data-testid={testId}
          data-color={color}
          className={cn(bannerVariants({ color }), className)}
        >
          {children}
        </div>
      </TestIdProvider>
    </BannerColorProvider>
  );
};

Banner.displayName = 'Banner';

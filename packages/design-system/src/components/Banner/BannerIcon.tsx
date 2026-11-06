import type { ComponentType, FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Info, OctagonAlert, type SvgIconProps, TriangleAlert } from '../../icons';
import { useTestId } from '../../utils/testId';
import { useBannerVariant } from './BannerContext';
import { type BannerVariant, bannerIconVariants } from './classes';

// Variants that show a default icon when none is provided. primary and
// secondary have no default icon.
const defaultIconMap: Partial<Record<BannerVariant, ComponentType<SvgIconProps>>> = {
  destructive: OctagonAlert,
  info: Info,
  warning: TriangleAlert,
};

export interface BannerIconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  /** Override the default icon for the variant. */
  icon?: ReactNode;
}

/**
 * Leading icon for Banner — compose it as a child of Banner.
 *
 * Automatically displays the appropriate icon based on the parent Banner's
 * variant: destructive, info, and warning each render a default icon; primary
 * and secondary render none. Pass a custom `icon` to override the default (or
 * to add an icon to primary/secondary).
 *
 * Renders nothing when there is no icon to show — i.e. on a variant without a
 * default icon and no custom `icon` provided.
 */
export const BannerIcon: FC<BannerIconProps> = ({ ref, icon, ...props }) => {
  const testId = useTestId('icon');
  const variant = useBannerVariant();
  const DefaultIcon = defaultIconMap[variant];

  const content =
    icon ??
    (DefaultIcon ? <DefaultIcon size='lg' className={bannerIconVariants({ variant })} /> : null);

  if (content == null) return null;

  return (
    <div
      {...props}
      ref={ref}
      data-slot='banner-icon'
      data-testid={testId}
      className='flex items-center py-2 shrink-0'
    >
      {content}
    </div>
  );
};

BannerIcon.displayName = 'BannerIcon';

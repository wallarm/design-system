import type { ComponentType, FC, ReactNode } from 'react';
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

export interface BannerIconProps {
  /** Custom icon — always overrides the variant default. */
  icon?: ReactNode;
}

/**
 * Leading icon for Banner — rendered internally by Banner, not part of the
 * public API.
 *
 * The destructive, info, and warning variants show a default icon; primary and
 * secondary show none. A custom `icon` (passed via Banner's `icon` prop) always
 * overrides the default. Renders nothing when there is no icon to show.
 */
export const BannerIcon: FC<BannerIconProps> = ({ icon }) => {
  const testId = useTestId('icon');
  const variant = useBannerVariant();
  const DefaultIcon = defaultIconMap[variant];

  const content =
    icon ??
    (DefaultIcon ? <DefaultIcon size='lg' className={bannerIconVariants({ variant })} /> : null);

  if (content == null) return null;

  return (
    <div data-slot='banner-icon' data-testid={testId} className='flex items-center py-2 shrink-0'>
      {content}
    </div>
  );
};

BannerIcon.displayName = 'BannerIcon';

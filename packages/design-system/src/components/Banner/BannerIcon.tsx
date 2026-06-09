import type { ComponentType, FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { CircleDashed, Info, OctagonAlert, type SvgIconProps, TriangleAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useBannerColor } from './BannerContext';
import { type BannerColor, bannerIconVariants } from './classes';

const iconMap: Record<BannerColor, ComponentType<SvgIconProps>> = {
  primary: CircleDashed,
  secondary: CircleDashed,
  destructive: OctagonAlert,
  info: Info,
  warning: TriangleAlert,
};

export interface BannerIconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  /** Override the default icon for the variant */
  icon?: ReactNode;
}

/**
 * Leading icon for Banner.
 *
 * Automatically displays the appropriate icon and color for the parent
 * Banner's variant. Can be overridden with a custom icon via the `icon` prop.
 */
export const BannerIcon: FC<BannerIconProps> = ({ ref, icon, className, ...props }) => {
  const testId = useTestId('icon');
  const color = useBannerColor();
  const IconComponent = iconMap[color];

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      className={cn('flex items-center py-2 shrink-0', className)}
    >
      {icon || <IconComponent size='lg' className={bannerIconVariants({ color })} />}
    </div>
  );
};

BannerIcon.displayName = 'BannerIcon';

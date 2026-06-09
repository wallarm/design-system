import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { useBannerColor } from './BannerContext';
import { bannerTitleVariants } from './classes';

export interface BannerTitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ref?: Ref<HTMLParagraphElement>;
  children: ReactNode;
  /**
   * Optional inline action rendered next to the title (e.g. a BannerLink).
   * Sits on the same row and wraps below on narrow viewports.
   */
  action?: ReactNode;
  /**
   * Maximum number of lines before the message is truncated (default: 1).
   * The design budget is 2 lines; 1 line is preferred.
   */
  lineClamp?: number;
}

/**
 * Title (message) for Banner.
 *
 * Renders the primary message with medium weight, truncating with a tooltip
 * when the text overflows. By default the message is a single line; set
 * `lineClamp` (e.g. 2) to allow it to wrap and clamp to that many lines.
 * An optional inline `action` (such as a BannerLink) is rendered on the same row.
 */
export const BannerTitle: FC<BannerTitleProps> = ({
  ref,
  children,
  action,
  lineClamp = 1,
  className,
  ...props
}) => {
  const testId = useTestId('title');
  const color = useBannerColor();
  const clampClass = lineClamp > 1 ? `line-clamp-${lineClamp}` : 'truncate';

  return (
    <div className='flex flex-wrap items-center gap-8 w-full'>
      <OverflowTooltip>
        <OverflowTooltipTrigger>
          <p
            {...props}
            ref={ref}
            data-testid={testId}
            className={cn(bannerTitleVariants({ color }), clampClass, className)}
          >
            {children}
          </p>
        </OverflowTooltipTrigger>
        <OverflowTooltipContent>{children}</OverflowTooltipContent>
      </OverflowTooltip>
      {action}
    </div>
  );
};

BannerTitle.displayName = 'BannerTitle';

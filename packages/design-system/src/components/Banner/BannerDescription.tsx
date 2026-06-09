import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { useBannerVariant } from './BannerContext';
import { bannerDescriptionVariants } from './classes';

export interface BannerDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
  children: ReactNode;
}

/**
 * Secondary description text for Banner.
 *
 * Rendered below the title with regular weight and a muted color appropriate
 * to the variant. Truncates with a tooltip when the text overflows.
 */
export const BannerDescription: FC<BannerDescriptionProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('description');
  const variant = useBannerVariant();

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger>
        <p
          {...props}
          ref={ref}
          data-testid={testId}
          className={cn(bannerDescriptionVariants({ variant }), 'truncate', className)}
        >
          {children}
        </p>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{children}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

BannerDescription.displayName = 'BannerDescription';

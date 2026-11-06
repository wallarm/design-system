import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Link, type LinkProps } from '../Link';
import { useBannerVariant } from './BannerContext';

export type BannerLinkProps = Omit<LinkProps, 'type' | 'size'>;

/**
 * Inline action link for Banner.
 *
 * Rendered next to the title (pass via `BannerTitle`'s `action` prop). The link
 * color adapts to the variant — light blue on the dark primary banner, default
 * blue on the light variants.
 */
export const BannerLink: FC<BannerLinkProps> = ({ weight = 'regular', ...props }) => {
  const testId = useTestId('link');
  const variant = useBannerVariant();

  return (
    <Link
      {...props}
      data-testid={testId}
      type={variant === 'primary' ? 'alt' : 'default'}
      size='md'
      weight={weight}
    />
  );
};

BannerLink.displayName = 'BannerLink';

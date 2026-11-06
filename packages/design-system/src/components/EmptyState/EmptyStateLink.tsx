import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Link, type LinkProps } from '../Link';

export type EmptyStateLinkProps = LinkProps;

export const EmptyStateLink: FC<EmptyStateLinkProps> = ({ size = 'md', ...props }) => {
  const testId = useTestId('link');

  return <Link {...props} size={size} data-slot='empty-state-link' data-testid={testId} />;
};

EmptyStateLink.displayName = 'EmptyStateLink';

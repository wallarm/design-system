import type { FC } from 'react';
import { Zap } from '../../icons';
import { cn } from '../../utils/cn';
import { segmentVariants } from './classes';

interface ParameterPathSegmentProps {
  /** Текст сегмента. */
  children: string;
  /** `default` для промежуточных, `highlighted` для терминального. */
  variant?: 'default' | 'highlighted';
  /** Показать иконку Zap (только на highlighted, в attack-контексте). */
  withZap?: boolean;
  className?: string;
}

export const ParameterPathSegment: FC<ParameterPathSegmentProps> = ({
  children,
  variant = 'default',
  withZap = false,
  className,
}) => (
  <span
    data-slot='parameter-path-segment'
    data-variant={variant}
    className={cn(segmentVariants({ variant }), className)}
  >
    {children}
    {withZap && variant === 'highlighted' ? (
      <Zap size='sm' className='text-icon-danger' aria-hidden='true' />
    ) : null}
  </span>
);

ParameterPathSegment.displayName = 'ParameterPathSegment';

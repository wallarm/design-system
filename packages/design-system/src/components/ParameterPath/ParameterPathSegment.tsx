import type { FC, HTMLAttributes } from 'react';
import { Zap } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { segmentVariants } from './classes';

interface ParameterPathSegmentProps extends HTMLAttributes<HTMLSpanElement> {
  /** Текст сегмента. */
  children: string;
  /** `default` для промежуточных, `highlighted` для терминального. */
  variant?: 'default' | 'highlighted';
  /** Показать иконку Zap (только на highlighted, в attack-контексте). */
  withZap?: boolean;
  /**
   * Индекс сегмента в пути. Используется для derive-теста-id вида `segment-N`.
   * Опционально: при использовании сегмента вне ParameterPath можно опустить.
   */
  index?: number;
}

export const ParameterPathSegment: FC<ParameterPathSegmentProps> = ({
  children,
  variant = 'default',
  withZap = false,
  index,
  className,
  ...rest
}) => {
  const testId = useTestId(index !== undefined ? `segment-${index}` : 'segment');
  return (
    <span
      {...rest}
      data-slot='parameter-path-segment'
      data-variant={variant}
      data-testid={testId}
      className={cn(segmentVariants({ variant }), className)}
    >
      {children}
      {withZap && variant === 'highlighted' ? (
        <Zap size='sm' className='text-icon-danger' aria-hidden='true' />
      ) : null}
    </span>
  );
};

ParameterPathSegment.displayName = 'ParameterPathSegment';

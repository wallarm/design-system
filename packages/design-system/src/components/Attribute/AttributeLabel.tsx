import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAttributeOrientation } from './AttributeOrientationContext';

export interface AttributeLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Width of the label cell in horizontal orientation, in pixels.
   * Defaults to 100. Clamped to [100, 256]. Ignored in vertical orientation.
   */
  width?: number;
  children?: ReactNode;
}

export const AttributeLabel: FC<AttributeLabelProps> = ({
  ref,
  children,
  className,
  width = 100,
  style,
  ...props
}) => {
  const testId = useTestId('label');
  const orientation = useAttributeOrientation();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      {...props}
      ref={ref}
      style={isHorizontal ? { ...style, width: `${width}px` } : style}
      data-testid={testId}
      data-slot='attribute-label'
      className={cn(
        'font-sans-display text-sm font-normal text-text-secondary',
        isHorizontal
          ? 'block min-w-[100px] max-w-[256px] py-4 shrink-0 truncate'
          : 'flex items-center gap-4 flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
};

AttributeLabel.displayName = 'AttributeLabel';

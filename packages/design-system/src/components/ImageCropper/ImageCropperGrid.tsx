import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface ImageCropperGridProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** Optional rule-of-thirds guide, clipped by the viewport. */
export const ImageCropperGrid: FC<ImageCropperGridProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('grid', testIdProp);
  return (
    <div
      {...props}
      ref={ref}
      aria-hidden='true'
      data-slot='image-cropper-grid'
      data-testid={testId}
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <span className='absolute inset-y-0 left-1/3 border-l border-border-primary/60' />
      <span className='absolute inset-y-0 left-2/3 border-l border-border-primary/60' />
      <span className='absolute inset-x-0 top-1/3 border-t border-border-primary/60' />
      <span className='absolute inset-x-0 top-2/3 border-t border-border-primary/60' />
    </div>
  );
};

ImageCropperGrid.displayName = 'ImageCropperGrid';

import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAttributeOrientation } from './AttributeOrientationContext';

export interface AttributeLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeLabel: FC<AttributeLabelProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('label');
  const orientation = useAttributeOrientation();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-label'
      className={cn(
        'font-sans-display text-sm font-normal text-text-secondary',
        isHorizontal
          ? 'block min-w-[100px] max-w-[160px] w-[160px] py-4 shrink-0 truncate'
          : 'flex items-center gap-4 flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
};

AttributeLabel.displayName = 'AttributeLabel';

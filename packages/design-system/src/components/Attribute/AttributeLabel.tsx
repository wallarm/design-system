import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AttributeLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeLabel: FC<AttributeLabelProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('label');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-label'
      className={cn(
        'flex items-center gap-4 flex-wrap font-sans-display text-sm font-normal text-text-secondary',
        className,
      )}
    >
      {children}
    </div>
  );
};

AttributeLabel.displayName = 'AttributeLabel';

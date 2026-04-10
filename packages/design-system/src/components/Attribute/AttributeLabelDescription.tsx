import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface AttributeLabelDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
}

export const AttributeLabelDescription: FC<AttributeLabelDescriptionProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('label-description');

  return (
    <p
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-label-description'
      className={cn('basis-full', className)}
    >
      {children}
    </p>
  );
};

AttributeLabelDescription.displayName = 'AttributeLabelDescription';

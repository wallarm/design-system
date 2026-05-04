import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { encodingVariants } from './classes';

interface ParameterPathEncodingProps extends HTMLAttributes<HTMLSpanElement> {
  children: string;
}

export const ParameterPathEncoding: FC<ParameterPathEncodingProps> = ({
  children,
  className,
  ...rest
}) => {
  const testId = useTestId('encoding');
  return (
    <span
      {...rest}
      data-slot='parameter-path-encoding'
      data-testid={testId}
      className={cn(encodingVariants(), className)}
    >
      {children}
    </span>
  );
};

ParameterPathEncoding.displayName = 'ParameterPathEncoding';

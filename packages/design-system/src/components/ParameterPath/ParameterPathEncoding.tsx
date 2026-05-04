import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { encodingVariants } from './classes';

interface ParameterPathEncodingProps {
  children: string;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const ParameterPathEncoding: FC<ParameterPathEncodingProps> = ({
  children,
  className,
  leftIcon,
  rightIcon,
}) => (
  <span data-slot='parameter-path-encoding' className={cn(encodingVariants(), className)}>
    {leftIcon}
    {children}
    {rightIcon}
  </span>
);

ParameterPathEncoding.displayName = 'ParameterPathEncoding';

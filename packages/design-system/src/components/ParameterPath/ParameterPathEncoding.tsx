import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { encodingVariants } from './classes';

interface ParameterPathEncodingProps {
  children: string;
  className?: string;
}

export const ParameterPathEncoding: FC<ParameterPathEncodingProps> = ({ children, className }) => (
  <span data-slot='parameter-path-encoding' className={cn(encodingVariants(), className)}>
    {children}
  </span>
);

ParameterPathEncoding.displayName = 'ParameterPathEncoding';

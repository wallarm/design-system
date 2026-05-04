import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Badge } from '../Badge';
import { HTTP_METHOD_COLOR } from './constants';
import type { HttpMethod } from './types';

interface ParameterPathMethodProps extends HTMLAttributes<HTMLSpanElement> {
  method: HttpMethod;
}

export const ParameterPathMethod: FC<ParameterPathMethodProps> = ({
  method,
  className,
  ...rest
}) => {
  const testId = useTestId('method');
  return (
    <span
      {...rest}
      data-slot='parameter-path-method'
      data-testid={testId}
      className={cn('flex items-center', className)}
    >
      <Badge type='secondary' color={HTTP_METHOD_COLOR[method]} size='medium' textVariant='code'>
        {method}
      </Badge>
    </span>
  );
};

ParameterPathMethod.displayName = 'ParameterPathMethod';

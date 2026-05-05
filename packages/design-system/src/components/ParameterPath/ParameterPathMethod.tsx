import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import type { HttpMethodName } from '../HttpMethod';
import { HttpMethod } from '../HttpMethod';

interface ParameterPathMethodProps extends HTMLAttributes<HTMLSpanElement> {
  method: HttpMethodName;
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
      <HttpMethod method={method} />
    </span>
  );
};

ParameterPathMethod.displayName = 'ParameterPathMethod';

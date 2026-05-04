import type { FC } from 'react';
import { Badge } from '../Badge';
import { HTTP_METHOD_COLOR } from './constants';
import type { HttpMethod } from './types';

interface ParameterPathMethodProps {
  method: HttpMethod;
}

export const ParameterPathMethod: FC<ParameterPathMethodProps> = ({ method }) => (
  <Badge
    data-slot='parameter-path-method'
    type='secondary'
    color={HTTP_METHOD_COLOR[method]}
    size='medium'
    textVariant='code'
  >
    {method}
  </Badge>
);

ParameterPathMethod.displayName = 'ParameterPathMethod';

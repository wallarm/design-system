import type { FC, HTMLAttributes, Ref } from 'react';
import { Badge, type BadgeProps } from '../Badge';
import { HTTP_METHOD_COLOR, OTHER_METHOD_COLOR } from './constants';
import type { HttpMethodName } from './types';

export interface HttpMethodProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * HTTP method to render. Known values from `HttpMethodName` get a dedicated
   * color via `HTTP_METHOD_COLOR`; any other string renders in slate as the
   * "Other" fallback (the text itself is shown verbatim).
   */
  method: HttpMethodName | (string & {});
  /** Badge size — defaults to `medium`. */
  size?: BadgeProps['size'];
  ref?: Ref<HTMLDivElement>;
}

const isKnownMethod = (method: string): method is HttpMethodName =>
  Object.hasOwn(HTTP_METHOD_COLOR, method);

/**
 * Domain primitive that renders an HTTP method as a colored Badge.
 *
 * Wrap-free; if you need to align it inside a flex row with non-badge
 * neighbours, place it in a parent flex container with `items-center`.
 */
export const HttpMethod: FC<HttpMethodProps> = ({ method, size = 'medium', ref, ...rest }) => {
  const color = isKnownMethod(method) ? HTTP_METHOD_COLOR[method] : OTHER_METHOD_COLOR;
  return (
    <Badge
      {...rest}
      ref={ref}
      data-method={method}
      type='secondary'
      color={color}
      size={size}
      textVariant='code'
    >
      {method}
    </Badge>
  );
};

HttpMethod.displayName = 'HttpMethod';

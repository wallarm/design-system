import type { FC, HTMLAttributes, Ref } from 'react';
import { Badge, type BadgeProps } from '../Badge';
import { getResponseCodeCategory, RESPONSE_CODE_COLOR } from './constants';

export interface ResponseCodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * HTTP response status code. The category (1xx/2xx/3xx/4xx/5xx) is derived
   * from the first digit and decides the Badge color via `RESPONSE_CODE_COLOR`.
   * Values outside 100–599 render in slate as the "unknown" fallback.
   */
  code: number | string;
  /** Badge size — defaults to `medium`. */
  size?: BadgeProps['size'];
  ref?: Ref<HTMLDivElement>;
}

/**
 * Domain primitive that renders an HTTP response status code as a colored Badge.
 * Pair with `HttpMethod` in API endpoint lists, request logs, and docs.
 */
export const ResponseCode: FC<ResponseCodeProps> = ({ code, size = 'medium', ref, ...rest }) => {
  const category = getResponseCodeCategory(code);
  return (
    <Badge
      {...rest}
      ref={ref}
      data-response-category={category}
      type='secondary'
      color={RESPONSE_CODE_COLOR[category]}
      size={size}
      textVariant='code'
    >
      {code}
    </Badge>
  );
};

ResponseCode.displayName = 'ResponseCode';

import type { FC } from 'react';
import { Fragment } from 'react';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { ParameterPathEncoding } from './ParameterPathEncoding';
import { ParameterPathJoint } from './ParameterPathJoint';
import { ParameterPathMethod } from './ParameterPathMethod';
import { ParameterPathSegment } from './ParameterPathSegment';
import type { ParameterPathProps } from './types';

export const ParameterPath: FC<ParameterPathProps> = ({
  ref,
  method,
  segments,
  encoding,
  attack = false,
  copyFormat: _copyFormat,
  className,
  'data-testid': testId,
  ...rest
}) => {
  const lastIndex = segments.length - 1;

  return (
    <TestIdProvider value={testId}>
      <div
        {...rest}
        ref={ref}
        data-testid={testId}
        data-slot='parameter-path'
        className={cn('flex items-center gap-0 min-w-0', className)}
      >
        {method ? (
          <>
            <ParameterPathMethod method={method} />
            {segments.length > 0 ? <ParameterPathJoint /> : null}
          </>
        ) : null}

        {segments.map((value, index) => {
          const isLast = index === lastIndex;
          return (
            <Fragment key={`${index}-${value}`}>
              <span data-testid={testId ? `${testId}--segment-${index}` : undefined}>
                <ParameterPathSegment
                  variant={isLast ? 'highlighted' : 'default'}
                  withZap={isLast && attack}
                >
                  {value}
                </ParameterPathSegment>
              </span>
              {!isLast ? <ParameterPathJoint /> : null}
            </Fragment>
          );
        })}

        {encoding ? (
          <>
            <ParameterPathJoint />
            <ParameterPathEncoding>{encoding}</ParameterPathEncoding>
          </>
        ) : null}
      </div>
    </TestIdProvider>
  );
};

ParameterPath.displayName = 'ParameterPath';

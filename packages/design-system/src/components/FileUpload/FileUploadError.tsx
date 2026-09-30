import type { ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';
import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { fileUploadErrorClassNames } from './classes';
import { useRequiredFileUploadRootContext } from './FileUploadContext';
import { formatRejection } from './lib';
import type { FileUploadErrorCode, FileUploadRejection } from './types';

export interface FileUploadErrorProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'>,
    TestableProps {
  /** Override a message: called once per (file, error) pair. */
  children?: (rejection: FileUploadRejection, code: FileUploadErrorCode) => ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline rejection message — names the file and the rule it broke ("policy.txt — Not a
 * .wasm file"). Renders nothing until a pick, drop or replace is rejected; clears on the
 * next accepted file or on delete. Styled like `FieldError`; use `FieldError` itself for
 * form-level errors (e.g. "required"). Test id slot: `{base}--rejections`.
 */
export const FileUploadError: FC<FileUploadErrorProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadError');
  // `rejections`, not `error`: under an inherited Field cascade `{field}--error` is FieldError's.
  const testId = useTestId('rejections', testIdProp);

  if (ctx.rejections.length === 0) return null;

  return (
    <div
      {...props}
      ref={ref}
      // Internal id: the pickers point `aria-describedby` at it.
      id={ctx.errorId}
      role='alert'
      data-slot='file-upload-error'
      data-testid={testId}
      className={cn(fileUploadErrorClassNames, className)}
    >
      {ctx.rejections.flatMap((rejection, i) =>
        rejection.errors.map(code => (
          <div key={`${i}-${code}`} className='flex gap-4'>
            <OctagonAlert size='md' className='my-2 shrink-0 self-start' />
            <Text size='sm' color='danger'>
              {children
                ? children(rejection, code)
                : formatRejection(rejection.file.name, code, ctx.limits, rejection.file.size)}
            </Text>
          </div>
        )),
      )}
    </div>
  );
};

FileUploadError.displayName = 'FileUploadError';

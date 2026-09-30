import { type ComponentPropsWithoutRef, type FC, Fragment, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { useFileUploadRootContext } from './FileUploadContext';

export interface FileUploadItemGroupProps
  extends Omit<ComponentPropsWithoutRef<'ul'>, 'children'>,
    TestableProps {
  /** A function maps over the accepted files; plain children render as-is (stored files). */
  children?: ReactNode | ((file: File, index: number) => ReactNode);
  ref?: Ref<HTMLUListElement>;
}

/**
 * The list of chosen files (Figma slot "Items"), 8px apart. Renders nothing when empty.
 * An own `data-testid` becomes the base for its rows (`{id}--item`, `{id}--item-name`, …) —
 * how a standalone stored-file list gets test ids.
 */
export const FileUploadItemGroup: FC<FileUploadItemGroupProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item-group', testIdProp);

  const files = root?.api.acceptedFiles ?? [];
  const content =
    typeof children === 'function'
      ? files.map((file, index) => (
          <Fragment key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
            {children(file, index)}
          </Fragment>
        ))
      : children;

  const isEmpty =
    content == null || content === false || (Array.isArray(content) && content.length === 0);
  if (isEmpty) return null;

  return (
    <ul
      {...props}
      ref={ref}
      data-slot='file-upload-item-group'
      data-testid={testId}
      className={cn('flex w-full min-w-0 flex-col gap-8', className)}
    >
      {testIdProp === undefined ? (
        content
      ) : (
        <TestIdProvider value={testIdProp}>{content}</TestIdProvider>
      )}
    </ul>
  );
};

FileUploadItemGroup.displayName = 'FileUploadItemGroup';

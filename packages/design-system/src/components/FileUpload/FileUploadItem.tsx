import {
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
  type Ref,
  useEffect,
  useMemo,
} from 'react';
import { File as FileIcon } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import {
  fileUploadItemActionsClassNames,
  fileUploadItemDescriptionClassNames,
  fileUploadItemIconClassNames,
  fileUploadItemNameClassNames,
  fileUploadItemVariants,
} from './classes';
import { useFileUploadRootContext } from './FileUploadContext';
import { FileUploadItemContextProvider } from './FileUploadItemContext';
import type { FileUploadItemFile } from './types';

export interface FileUploadItemProps extends ComponentPropsWithoutRef<'li'>, TestableProps {
  /** A picked `File`, or a stored file described by `{ name, size? }`. */
  file: FileUploadItemFile;
  /** Second line, e.g. "32 KB · uploads when you save". */
  description?: ReactNode;
  /** Uploading: dims the row, shows a spinner and locks the picker until it clears. */
  loading?: boolean;
  /** Replaces the default file icon. */
  icon?: ReactNode;
  /** Actions: `FileUploadItemReplaceTrigger`, `FileUploadItemAction`, `FileUploadItemDeleteTrigger`. */
  children?: ReactNode;
  ref?: Ref<HTMLLIElement>;
}

/**
 * One file: icon, name (truncates — full name in a tooltip), optional description and a
 * slot of small ghost icon actions. Works inside `FileUpload` or on its own (stored files).
 * An own `data-testid` becomes the base for this row's parts (`{id}--item-name`,
 * `{id}--item-delete-trigger`, …), so one row can be targeted without an id on every action.
 */
export const FileUploadItem: FC<FileUploadItemProps> = ({
  file,
  description,
  loading = false,
  icon,
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item', testIdProp);
  // An own test id becomes the base for this row's parts: `{id}--item-name`, `{id}--item-delete-trigger`, …
  const own = (slot: string) => (testIdProp === undefined ? undefined : `${testIdProp}--${slot}`);
  const cascadeNameTestId = useTestId('item-name');
  const cascadeDescriptionTestId = useTestId('item-description');
  const nameTestId = own('item-name') ?? cascadeNameTestId;
  const descriptionTestId = own('item-description') ?? cascadeDescriptionTestId;
  const registerLoading = root?.registerLoading;

  // A real side effect (not derived state): hold the root's upload lock while mounted + loading.
  useEffect(() => {
    if (!loading || !registerLoading) return;
    return registerLoading();
  }, [loading, registerLoading]);

  const itemContext = useMemo(() => ({ file, loading }), [file, loading]);
  const hasActions = Boolean(children) || loading;

  return (
    <li
      {...props}
      ref={ref}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
      data-slot='file-upload-item'
      data-testid={testId}
      className={cn(fileUploadItemVariants(), className)}
    >
      <span className={fileUploadItemIconClassNames}>{icon ?? <FileIcon size='md' />}</span>
      <div className='flex min-w-0 flex-1 flex-col'>
        <OverflowTooltip>
          <OverflowTooltipTrigger asChild>
            <span
              data-slot='file-upload-item-name'
              data-testid={nameTestId}
              className={fileUploadItemNameClassNames}
            >
              {file.name}
            </span>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{file.name}</OverflowTooltipContent>
        </OverflowTooltip>
        {description ? (
          <span
            data-slot='file-upload-item-description'
            data-testid={descriptionTestId}
            className={fileUploadItemDescriptionClassNames}
          >
            {description}
          </span>
        ) : null}
      </div>
      {hasActions ? (
        <div data-slot='file-upload-item-actions' className={fileUploadItemActionsClassNames}>
          <FileUploadItemContextProvider value={itemContext}>
            {testIdProp === undefined ? (
              children
            ) : (
              <TestIdProvider value={testIdProp}>{children}</TestIdProvider>
            )}
          </FileUploadItemContextProvider>
          {loading ? <Loader type='sonner' size='md' color='primary' /> : null}
        </div>
      ) : null}
    </li>
  );
};

FileUploadItem.displayName = 'FileUploadItem';

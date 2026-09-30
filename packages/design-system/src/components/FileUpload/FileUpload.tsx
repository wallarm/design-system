import {
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import {
  FileUpload as ArkFileUpload,
  type FileUploadFileAcceptDetails,
  type FileUploadFileRejectDetails,
  useFileUpload,
} from '@ark-ui/react/file-upload';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { fileUploadVariants } from './classes';
import {
  FileUploadRootContextProvider,
  type FileUploadRootContextValue,
} from './FileUploadContext';
import { toAcceptList, toAcceptString } from './lib';
import type { FileUploadRejection } from './types';

export interface FileUploadProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'children'>,
    TestableProps {
  /** Controlled accepted files. */
  value?: File[];
  /** Uncontrolled initial files. */
  defaultValue?: File[];
  /** Every change to the accepted list — pick, drop, replace, delete (then `[]`). */
  onValueChange?: (files: File[]) => void;
  /** Files that failed validation (for consumers that also want a toast). */
  onFileReject?: (rejections: FileUploadRejection[]) => void;
  /** Extensions and/or MIME types: `'.so,.dylib'`, `'image/png'`, `['.lua']`. */
  accept?: string | string[];
  /** Default `1`: a new pick replaces the file, and the picker hides while one is chosen. */
  maxFiles?: number;
  /** Bytes. Checked on pick, drop and replace. */
  maxFileSize?: number;
  /** Bytes. */
  minFileSize?: number;
  /** Custom rules; returned strings are shown verbatim as rejection messages. */
  validate?: (file: File) => string[] | null;
  /** Hidden input name — the files submit with a native form under it. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Hides the picker, Delete and Replace; `FileUploadItemAction` (e.g. Download) stays. */
  readOnly?: boolean;
  /** Error state (maps to Ark `invalid`); also read from a wrapping `Field`. */
  error?: boolean;
  /** Default `true`. */
  allowDrop?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * FileUpload — attach files to a form: pick with a drop Area (`FileUploadDropzone`) or a
 * button (`FileUploadTrigger`), check type and size before anything is sent, and list the
 * chosen files as `FileUploadItem` rows. Built on `@ark-ui/react/file-upload`.
 *
 * Picking never uploads: files are held in `value` and in the hidden input (`name`) and go
 * with the form on save. The consumer owns the network — mark a row `loading` while it
 * uploads (that locks the picker) and compose `FileUploadItemAction` for Download.
 * Reads `Field` context (label, required, disabled, read-only, invalid).
 */
export const FileUpload: FC<FileUploadProps> = ({
  value,
  defaultValue,
  onValueChange,
  onFileReject,
  accept,
  maxFiles = 1,
  maxFileSize,
  minFileSize,
  validate,
  name,
  required,
  disabled,
  readOnly,
  error = false,
  allowDrop = true,
  className,
  children,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const field = useFieldContext();
  // No own test id → keep the parent's (e.g. Field's) cascade instead of cutting it off.
  const inheritedTestId = useTestId();
  const testId = testIdProp ?? inheritedTestId;

  // Ark spreads our props OVER its Field defaults, so pass fully resolved values.
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly ?? false;
  const isRequired = required ?? field?.required ?? false;
  const invalid = error || Boolean(field?.invalid);
  const single = maxFiles <= 1;

  const [loadingCount, setLoadingCount] = useState(0);
  const registerLoading = useCallback(() => {
    setLoadingCount(count => count + 1);
    return () => setLoadingCount(count => count - 1);
  }, []);
  const locked = loadingCount > 0;

  // Rejections from the multi-mode Replace, which validates outside Ark.
  const [replaceRejections, setReplaceRejections] = useState<FileUploadRejection[]>([]);

  const acceptString = toAcceptString(accept);
  const acceptList = useMemo(() => toAcceptList(accept), [accept]);

  // Single mode: re-picking the identical file is a no-op, not an error.
  const visible = useCallback(
    (rejections: FileUploadRejection[]) =>
      rejections
        .map(r => ({
          file: r.file,
          errors: single ? r.errors.filter(e => e !== 'FILE_EXISTS') : r.errors,
        }))
        .filter(r => r.errors.length > 0),
    [single],
  );

  const handleAccept = useCallback(
    (details: FileUploadFileAcceptDetails) => {
      setReplaceRejections([]);
      onValueChange?.(details.files);
    },
    [onValueChange],
  );

  const handleReject = useCallback(
    (details: FileUploadFileRejectDetails) => {
      const shown = visible(details.files);
      if (shown.length) onFileReject?.(shown);
    },
    [visible, onFileReject],
  );

  const api = useFileUpload({
    name,
    accept: acceptString,
    maxFiles,
    maxFileSize,
    minFileSize,
    validate: validate ? file => validate(file) : undefined,
    required: isRequired,
    disabled: isDisabled,
    readOnly: isReadOnly,
    invalid,
    allowDrop: allowDrop && !locked,
    acceptedFiles: value,
    defaultAcceptedFiles: defaultValue,
    onFileAccept: handleAccept,
    onFileReject: handleReject,
  });

  const reportRejections = useCallback(
    (rejections: FileUploadRejection[]) => {
      setReplaceRejections(rejections);
      if (rejections.length) onFileReject?.(rejections);
    },
    [onFileReject],
  );

  const clearRejections = useCallback(() => {
    api.clearRejectedFiles();
    setReplaceRejections([]);
  }, [api]);

  const errorId = useId();
  const hasFiles = api.acceptedFiles.length > 0;
  const rejections = useMemo(
    () => [...visible(api.rejectedFiles), ...replaceRejections],
    [visible, api.rejectedFiles, replaceRejections],
  );

  const contextValue = useMemo<FileUploadRootContextValue>(
    () => ({
      api,
      single,
      disabled: isDisabled,
      readOnly: isReadOnly,
      invalid,
      locked,
      pickerHidden: isReadOnly || (single && hasFiles),
      pickerBlocked: isDisabled || locked || (!single && api.maxFilesReached),
      accept: acceptString,
      limits: { acceptList, maxFiles, maxFileSize, minFileSize },
      validate,
      rejections,
      reportRejections,
      clearRejections,
      registerLoading,
      errorId,
    }),
    [
      api,
      single,
      isDisabled,
      isReadOnly,
      invalid,
      locked,
      hasFiles,
      acceptString,
      acceptList,
      maxFiles,
      maxFileSize,
      minFileSize,
      validate,
      rejections,
      reportRejections,
      clearRejections,
      registerLoading,
      errorId,
    ],
  );

  return (
    <ArkFileUpload.RootProvider
      {...rest}
      value={api}
      ref={ref}
      data-slot='file-upload'
      // Only an OWN test id goes on the root — an inherited (Field) one would duplicate the Field's.
      data-testid={testIdProp}
      className={cn(fileUploadVariants(), className)}
    >
      <FileUploadRootContextProvider value={contextValue}>
        <TestIdProvider value={testId}>{children}</TestIdProvider>
      </FileUploadRootContextProvider>
      {/* Always mounted: Replace and form submission need it even while the picker is hidden. */}
      <ArkFileUpload.HiddenInput
        data-slot='file-upload-hidden-input'
        data-testid={testId ? `${testId}--hidden-input` : undefined}
      />
    </ArkFileUpload.RootProvider>
  );
};

FileUpload.displayName = 'FileUpload';

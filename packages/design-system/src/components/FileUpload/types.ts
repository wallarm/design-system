/**
 * Why a file was rejected. The first five are Ark/zag codes; any other string is a
 * message returned by the consumer's `validate()` and is shown verbatim.
 */
export type FileUploadErrorCode =
  | 'FILE_INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'TOO_MANY_FILES'
  | 'FILE_EXISTS'
  | (string & {});

export interface FileUploadRejection {
  file: File;
  errors: FileUploadErrorCode[];
}

/** A picked `File`, or a stored server file described by name (and optional size). */
export type FileUploadItemFile = File | { name: string; size?: number };

/** The limits the default rejection messages quote. */
export interface FileUploadLimits {
  acceptList: string[];
  maxFiles: number;
  maxFileSize?: number;
  minFileSize?: number;
}

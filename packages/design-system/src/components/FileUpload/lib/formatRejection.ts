import type { FileUploadErrorCode, FileUploadLimits } from '../types';
import { formatFileSize } from './formatFileSize';

const describe = (
  code: FileUploadErrorCode,
  limits: FileUploadLimits,
  fileSize?: number,
): string => {
  switch (code) {
    case 'FILE_INVALID_TYPE':
      return `Not a ${limits.acceptList.join(' / ')} file`;
    case 'FILE_TOO_LARGE':
      return `Too large: ${formatFileSize(fileSize ?? 0)}; the limit is ${formatFileSize(limits.maxFileSize ?? 0)}`;
    case 'FILE_TOO_SMALL':
      return `Too small: ${formatFileSize(fileSize ?? 0)}; the minimum is ${formatFileSize(limits.minFileSize ?? 0)}`;
    case 'TOO_MANY_FILES':
      return `Too many files; the limit is ${limits.maxFiles}`;
    case 'FILE_EXISTS':
      return 'Already added';
    default:
      return code;
  }
};

/** Default message for one (file, error) pair: `{name} — {message}`. */
export const formatRejection = (
  fileName: string,
  code: FileUploadErrorCode,
  limits: FileUploadLimits,
  fileSize?: number,
): string => `${fileName} — ${describe(code, limits, fileSize)}`;

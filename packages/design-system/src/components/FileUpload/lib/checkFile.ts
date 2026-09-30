import { isValidFileType } from '@zag-js/file-utils';
import type { FileUploadErrorCode } from '../types';

export interface FileCheckRules {
  acceptList: string[];
  maxFileSize?: number;
  minFileSize?: number;
  validate?: (file: File) => string[] | null;
}

/**
 * The same rules Ark applies on pick/drop (type → size → custom), for the one path Ark
 * cannot validate without side effects: replacing a single file in multiple-file mode
 * (`api.setFiles` re-validates the whole list and would drop the original on failure).
 */
export const checkFile = (file: File, rules: FileCheckRules): FileUploadErrorCode[] => {
  const errors: FileUploadErrorCode[] = [];
  // zag's own type check: an empty `file.type` falls back to the MIME type guessed from the
  // extension, and `application/x-moz-file` passes — so Replace agrees with pick and drop.
  const [typeOk] = isValidFileType(
    file,
    rules.acceptList.length ? rules.acceptList.join(',') : undefined,
  );
  if (!typeOk) errors.push('FILE_INVALID_TYPE');
  if (rules.maxFileSize !== undefined && file.size > rules.maxFileSize)
    errors.push('FILE_TOO_LARGE');
  if (rules.minFileSize !== undefined && file.size < rules.minFileSize)
    errors.push('FILE_TOO_SMALL');
  const custom = rules.validate?.(file);
  if (custom) errors.push(...custom);
  return errors;
};

import type { FileUploadErrorCode } from '../types';

export interface FileCheckRules {
  acceptList: string[];
  maxFileSize?: number;
  minFileSize?: number;
  validate?: (file: File) => string[] | null;
}

const matchesAccept = (file: File, acceptList: string[]): boolean => {
  if (acceptList.length === 0) return true;
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return acceptList.some(entry => {
    const type = entry.toLowerCase();
    if (type.startsWith('.')) return name.endsWith(type);
    if (type.endsWith('/*')) return mime.split('/')[0] === type.slice(0, -2);
    return mime === type;
  });
};

/**
 * The same rules Ark applies on pick/drop (type → size → custom), for the one path Ark
 * cannot validate without side effects: replacing a single file in multiple-file mode
 * (`api.setFiles` re-validates the whole list and would drop the original on failure).
 */
export const checkFile = (file: File, rules: FileCheckRules): FileUploadErrorCode[] => {
  const errors: FileUploadErrorCode[] = [];
  if (!matchesAccept(file, rules.acceptList)) errors.push('FILE_INVALID_TYPE');
  if (rules.maxFileSize !== undefined && file.size > rules.maxFileSize)
    errors.push('FILE_TOO_LARGE');
  if (rules.minFileSize !== undefined && file.size < rules.minFileSize)
    errors.push('FILE_TOO_SMALL');
  const custom = rules.validate?.(file);
  if (custom) errors.push(...custom);
  return errors;
};

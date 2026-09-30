import { createContext, useContext } from 'react';
import type { UseFileUploadReturn } from '@ark-ui/react/file-upload';
import type { FileUploadLimits, FileUploadRejection } from './types';

export interface FileUploadRootContextValue {
  /** The Ark/zag API (accepted files, deleteFile, setFiles, openFilePicker, …). */
  api: UseFileUploadReturn;
  /** `maxFiles === 1`: a new pick replaces the file; the picker stays visible. */
  single: boolean;
  disabled: boolean;
  readOnly: boolean;
  /** Own `error` or Field `invalid` (rejections are tracked separately in `rejections`). */
  invalid: boolean;
  /** Some `FileUploadItem loading` is mounted — the picker is locked until it finishes. */
  locked: boolean;
  /** Pickers render nothing while read-only (a chosen file never hides them). */
  pickerHidden: boolean;
  /** Pickers render but are inert: disabled, locked, or multiple mode at `maxFiles`. */
  pickerBlocked: boolean;
  /** Native / Ark accept string. */
  accept: string | undefined;
  limits: FileUploadLimits;
  validate?: (file: File) => string[] | null;
  /** Rejections to display (Ark's, minus single-mode FILE_EXISTS, plus multi-mode Replace ones). */
  rejections: FileUploadRejection[];
  /** Used by the multi-mode Replace, which validates outside Ark. */
  reportRejections: (rejections: FileUploadRejection[]) => void;
  /** Clears Ark's and the DS's rejections (on delete). */
  clearRejections: () => void;
  /**
   * `api.setFiles` that also reports and writes the hidden input when zag sees no change
   * (an edited file with the same name, size and type).
   */
  commitFiles: (files: File[]) => void;
  /** Registers one loading row; returns the unregister cleanup. */
  registerLoading: () => () => void;
  /** Id of `FileUploadError`, for `aria-describedby` on the pickers. */
  errorId: string;
}

const FileUploadRootContext = createContext<FileUploadRootContextValue | null>(null);

export const FileUploadRootContextProvider = FileUploadRootContext.Provider;

/** Nullable — rows (`FileUploadItem*`) may render outside a `FileUpload` (stored-file lists). */
export const useFileUploadRootContext = (): FileUploadRootContextValue | null =>
  useContext(FileUploadRootContext);

export const useRequiredFileUploadRootContext = (part: string): FileUploadRootContextValue => {
  const context = useContext(FileUploadRootContext);
  if (!context) throw new Error(`${part} must be rendered inside <FileUpload>.`);
  return context;
};

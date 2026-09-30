import { createContext, useContext } from 'react';
import type { FileUploadItemFile } from './types';

export interface FileUploadItemContextValue {
  file: FileUploadItemFile;
  loading: boolean;
}

const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(null);

export const FileUploadItemContextProvider = FileUploadItemContext.Provider;

export const useRequiredFileUploadItemContext = (part: string): FileUploadItemContextValue => {
  const context = useContext(FileUploadItemContext);
  if (!context) throw new Error(`${part} must be rendered inside <FileUploadItem>.`);
  return context;
};

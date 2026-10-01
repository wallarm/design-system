import { useContext } from 'react';
import {
  CodeSnippetFrameContext,
  type CodeSnippetFrameContextValue,
} from '../CodeSnippetFrameContext';

export const useCodeSnippetFrame = (): CodeSnippetFrameContextValue => {
  const context = useContext(CodeSnippetFrameContext);
  if (!context) {
    throw new Error('useCodeSnippetFrame must be used within CodeSnippetRoot or CodeEditorRoot');
  }
  return context;
};

import { useContext } from 'react';
import {
  CodeSnippetChromeContext,
  type CodeSnippetChromeContextValue,
} from '../CodeSnippetChromeContext';

export const useCodeSnippetChrome = (): CodeSnippetChromeContextValue => {
  const context = useContext(CodeSnippetChromeContext);
  if (!context) {
    throw new Error('useCodeSnippetChrome must be used within CodeSnippetRoot or CodeEditorRoot');
  }
  return context;
};
